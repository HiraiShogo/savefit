from flask import Flask, render_template, request, jsonify, session, url_for, redirect, Response, flash,flash
from werkzeug.security import check_password_hash, generate_password_hash
from base64 import b64encode, b64decode
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import mysql.connector
from datetime import timedelta
import smtplib, ssl
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import json
import os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with open('../password.json') as f:
    password_dict = json.load(f)
sqlserver_pass = password_dict['sql_server_pass']
server_URL = 'localhost:8000'
#server_URL = 'https://www/savefit'
'''
#SQL処理
cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
cursor = cnx.cursor()

cursor.close()
cnx.close()
'''

'''
Outlookメール送信
'''
def send_message(subject, mail_to, body):
    my_account = password_dict['savefit_outlook_email']
    my_password = password_dict['savefit_outlook_password']

    msg = MIMEText(body, 'html') #メッセージ本文
    msg['Subject'] = subject #件名
    msg['To'] = mail_to #宛先
    msg['From'] = my_account #送信元

    server = smtplib.SMTP('smtp.office365.com', 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(my_account, my_password)
    server.send_message(msg)

'''
共通鍵作成、暗号化・復号化
'''    
# 鍵の作成
def create_key():
    key = get_random_bytes(AES.block_size)
    return b64encode(key).decode('utf-8')

# 暗号化する
def encrypt(key, data):
    key = b64decode(key)
    data = bytes(data, 'utf-8')
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(data, AES.block_size))
    iv = b64encode(cipher.iv).decode('utf-8')
    ct = b64encode(ct_bytes).decode('utf-8')
    return ct, iv

# 復号化する
def decrypt(key, iv, ct):
    key = b64decode(key)
    iv = b64decode(iv)
    ct = b64decode(ct)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), AES.block_size)
    return pt.decode('utf-8')

app = Flask(__name__)
app.secret_key = password_dict['flask_app_secret_key']
app.permanent_session_lifetime = timedelta(days=1)#days=1

@app.route('/')
def index():
    if "id" in session:
        id = session["id"]
        #SQL処理
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        sql = "select username from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        user_name = result[0][0]
        cursor.close()
        cnx.close()

        return render_template('index.html', user_name=user_name)
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        form_user_mail = request.form['user_mail']
        form_hash_pass = request.form['hash_pass']
        form_user_pass = request.form['user_pass']
        print("hashパスワード：{}".format(form_hash_pass))
        print("userパスワード：{}".format(form_user_pass))
        #SQL処理
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        sql = "select id, password, mail_certification from user_info where email=%s"
        cursor.execute(sql, (form_user_mail,))
        result = cursor.fetchall()
        id = result[0][0]
        user_pass = result[0][1]
        mail_certification = result[0][2]
        cursor.close()
        cnx.close()

        if (len(result)==0):
            return render_template('login.html', warning="again")
        elif(user_pass!=form_user_pass):
            return render_template('login.html', warning="pass_different")
        elif(mail_certification!=True):
            return render_template('login.html', warning="certification_different")
        else:
            session.permanent = True
            session["id"] = id
            
            return redirect(url_for("index"))
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user_name = request.form['user_name']
        user_mail = request.form['user_mail']
        user_pass = request.form['user_pass']

        #SQL処理
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        #メール重複　確認
        sql = "select * from user_info where email=%s"
        cursor.execute(sql, [user_mail])
        mail_check_result = cursor.fetchall()
        cursor.close()
        cnx.close()

        if len(mail_check_result)!=0:#メール重複あり
            return render_template('register.html', warning="e-mail")
        else:

            #SQL処理
            cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                                        password=sqlserver_pass)
            cursor = cnx.cursor()
            #{user_info}テーブルにデータ追加
            sql = "INSERT INTO user_info (username, email, password) VALUE (%s, %s, %s)"
            cursor.execute(sql, (user_name, user_mail, user_pass))
            cnx.commit()
            sql = "select id from user_info where email=%s"
            cursor.execute(sql, (user_mail,))
            id = cursor.fetchall()[0][0]

            #暗号化
            key = create_key()
            deadline_time = str(datetime.now() + timedelta(minutes=30))
            ct, iv = encrypt(key, deadline_time)

            #ctの"+"を"%2B"に変換する  "+"はクエリパラメータで使えない
            ct_replace_plus = ct.replace("+", "%2B")
            temporary_URL = server_URL + '/register_certification?encrypt_text=' + ct_replace_plus

            #SQL処理
            #{temporary_registration_list}テーブルにデータ追加
            sql = "INSERT INTO temporary_registration_list (id, email, time_limit, secret_key, encrypt_text, padding_text) \
                VALUE (%s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (id, user_mail, deadline_time, key, ct, iv))
            cnx.commit()
            cursor.close()
            cnx.close()

            #期限の表記変更 秒単位を消す
            deadline_time = datetime.strptime(deadline_time, '%Y-%m-%d %H:%M:%S.%f')
            deadline_time = str(deadline_time.strftime('%Y-%m-%d %H:%M'))

            #認証メール送信
            send_message(subject='SaveFit 仮登録完了のお知らせ', mail_to=user_mail, body='''
                下記リンクをクリックすると本登録が完了します。<br>
                期限:{}まで<br><br>
                <a href="{}">{}</a><br>
                '''.format(deadline_time, temporary_URL, temporary_URL))

            return render_template('register_done.html')
    return render_template('register.html')


@app.route('/register_certification', methods=["GET"])
def register_certification():
    encrypt_deadline = request.args.get("encrypt_text")
    #SQL処理
    cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                        password=sqlserver_pass)
    cursor = cnx.cursor()
    #メール重複　確認
    sql = "select * from temporary_registration_list where encrypt_text=%s"
    cursor.execute(sql, [encrypt_deadline])
    temporary_registration_result = cursor.fetchall()
    cursor.close()
    cnx.close()
    if len(temporary_registration_result)!=0:
        id = temporary_registration_result[0][0]
        decrypt_deadline = decrypt(key=temporary_registration_result[0][3], iv=temporary_registration_result[0][5], \
                                ct=temporary_registration_result[0][4])
        deadline_time = temporary_registration_result[0][2]
        decrypt_deadline = datetime.strptime(decrypt_deadline, "%Y-%m-%d %H:%M:%S.%f")
        deadline_time = datetime.strptime(deadline_time, "%Y-%m-%d %H:%M:%S.%f")

        #SQL処理 
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        sql = ('DELETE FROM temporary_registration_list WHERE id=%s')
        cursor.execute(sql, [id])
        cnx.commit()
        cursor.close()
        cnx.close()

        if decrypt_deadline <= deadline_time:

            #SQL処理 
            cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                                password=sqlserver_pass)
            cursor = cnx.cursor()
            sql = ('UPDATE user_info SET mail_certification = %s WHERE id = %s')
            cursor.execute(sql, (True, id))
            cnx.commit()
            cursor.close()
            cnx.close()

            return render_template('register_complete.html')
        else:
            return render_template('register_expired.html')
    else:
        return render_template('register_expired.html')

@app.route("/logout") #ログアウトする
def logout():
    session.pop("id", None) #削除
    return redirect(url_for("index"))

@app.route("/mypage")
def mypage():
    if "id" in session:
        id = session["id"]
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        #SQL処理
        sql = "select * from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        user_name = result[0][2]
        self_introduction = result[0][5]
        icon_path = result[0][6]
        cursor.close()
        cnx.close()
        return render_template('mypage.html', user_name=user_name, self_introduction=self_introduction, icon_path=icon_path)
    else:
        return redirect(url_for("login"))

@app.route("/mypage_edit", methods=['GET', 'POST'])
def mypage_edit():
    if "id" in session:
        id = session["id"]
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        #SQL処理
        sql = "select * from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        user_name = result[0][2]
        self_introduction = result[0][5]
        icon_path = result[0][6]
        cursor.close()
        cnx.close()
        if request.method == "POST":
            post_user_name = request.form['username']
            post_user_icon = request.form['icon']
            post_user_intro = request.form['self_introduction']

            #SQL処理
            cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
            cursor = cnx.cursor()

            if len(post_user_icon)==0:
                sql = ('UPDATE user_info SET username=%s, self_introduction=%s WHERE id = %s')
                cursor.execute(sql, (post_user_name, post_user_intro, id))
                cnx.commit()
            else:
                user_icon_b64dec = b64decode(post_user_icon)
                icon_save_path = 'static/pic/icon_'+str(id)+'.jpg'
                with open(icon_save_path, mode='wb') as f:
                    f.write(user_icon_b64dec)

                sql = ('UPDATE user_info SET username=%s, self_introduction=%s, icon_path=%s WHERE id = %s')
                cursor.execute(sql, (post_user_name, post_user_intro, icon_save_path, id))
                cnx.commit()
            cursor.close()
            cnx.close()

            return redirect(url_for("mypage"))
        else:
            return render_template('mypage_edit.html', user_name=user_name, self_introduction=self_introduction, icon_path=icon_path)
    return redirect(url_for("login"))

@app.route("/account_setting", methods=['GET', 'POST'])
def account_setting():
    if "id" in session:
        id = session["id"]
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        #SQL処理
        sql = "select * from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        user_name = result[0][2]
        self_introduction = result[0][5]
        icon_path = result[0][6]
        cursor.close()
        cnx.close()
        return render_template('account_setting.html', user_name=user_name, self_introduction=self_introduction, icon_path=icon_path)
    else:
        return redirect(url_for("login"))

@app.route("/live", methods=['GET', 'POST'])
def live():
    if "id" in session:
        id = session["id"]
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        #SQL処理
        sql = "select * from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        user_name = result[0][2]
        self_introduction = result[0][5]
        icon_path = result[0][6]
        cursor.close()
        cnx.close()

        
        # クエリパラメータ'room'に文字や記号などが渡された時のエラー処理
        try:
            room_num = int(request.args.get("room"))
            room_people = int(request.args.get("roompeople"))
            if (1 <= room_num <= 9)&(room_people<=50):
                return render_template('live.html', user_name=user_name, \
                                        self_introduction=self_introduction, \
                                        icon_path=icon_path, \
                                        room_num=str(room_num),\
                                        app_id=password_dict['skyway_app_id'],\
                                        secret_key=password_dict['skyway_secret_key']
                                        )
            else:
                return redirect(url_for("live_room_select"))
        except:
            return redirect(url_for("live_room_select"))

    else:
        return redirect(url_for("login"))

@app.route("/live_room_select")
def live_room_select():
    if "id" in session:
        id = session["id"]
        #SQL処理
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        sql = "select username from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        user_name = result[0][0]
        cursor.close()
        cnx.close()
        return render_template('live_room_select.html', user_name=user_name,\
                                app_id=password_dict['skyway_app_id'],\
                                secret_key=password_dict['skyway_secret_key'])
    else:
        return redirect(url_for("login"))

@app.route("/password_reset", methods=['GET', 'POST'])
def password_reset():
    warning = ''
    if "id" in session:
        id = session["id"]

        #SQL処理
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        sql = "select username, password from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        sql_username = result[0][0]
        sql_pass = result[0][1]
        cursor.close()
        cnx.close()

        if request.method == 'POST':
            user_pass = request.form['user_pass']
            user_newpass = request.form['user_newpass']
            if user_pass == sql_pass:
                #SQL処理 
                cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                                    password=sqlserver_pass)
                cursor = cnx.cursor()
                sql = ('UPDATE user_info SET password = %s WHERE id = %s')
                cursor.execute(sql, (user_newpass, id))
                cnx.commit()
                cursor.close()
                cnx.close()
                return redirect(url_for("account_setting"))
            else:
                warning = 'pass_different'
                return render_template('password_reset.html', user_name=sql_username, warning=warning)
        else:
            return render_template('password_reset.html', user_name=sql_username)
    else:
        return redirect(url_for("login"))

@app.route("/account_delete", methods=['GET', 'POST'])
def account_delete():
    if "id" in session:
        id = session["id"]

        #SQL処理
        cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                            password=sqlserver_pass)
        cursor = cnx.cursor()
        sql = "select username from user_info where id=%s"
        cursor.execute(sql, (id,))
        result = cursor.fetchall()
        user_name = result[0][0]
        cursor.close()
        cnx.close()

        if request.method == 'POST':
            # アカウント削除
            #SQL処理 
            cnx=mysql.connector.connect(host="localhost", user="root", port="3306",database="test", \
                                password=sqlserver_pass)
            cursor = cnx.cursor()
            sql = ('DELETE FROM user_info WHERE id=%s')
            cursor.execute(sql, [id])
            cnx.commit()
            cursor.close()
            cnx.close()

            session.pop("id", None) #削除
            return redirect(url_for("index"))
        else:
            return render_template('account_delete.html', user_name=user_name)
    else:
        return redirect(url_for("login"))



if __name__ == '__main__' :
    app.run(host='0.0.0.0', port=8000, threaded=True, debug=True)