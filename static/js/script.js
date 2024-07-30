function main () {

  // ログイン画面　パスワード表示・非表示
  const showPasswordButton = document.getElementById("hidden_button");
  showPasswordButton.addEventListener("click", togglePasswordVisibility);
  function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      showPasswordButton.value = "非表示";
    } else {
      passwordInput.type = "password";
      showPasswordButton.value = "表示";
    }
  }
 
  // ヘッダー　表示名にカーソルを合わせるとメニューが表示される
  const header_right = document.getElementById('header2-right1');
  header_right.addEventListener('mouseover', function(){
    const dropdown_menu = document.getElementById('dropdown-nav')
    dropdown_menu.style.visibility = "visible";
  })

  // ログイン、サインイン画面　フォーム送信時にパスワードをハッシュ化してから送信
  const submit = document.getElementById('submit');
  const form = document.getElementById('login-form');
  submit.addEventListener('click', (e) => {
    e.preventDefault();
    let password = document.getElementById('password');
    //----------------ハッシュ化--------------
    const encoder = new TextEncoder();
    const msgUint8 = encoder.encode(password);

    // エンコードされたメッセージのSHA-256ハッシュを計算する
    // ここでWeb Crypto APIを使用している
    const hashBuffer = crypto.subtle.digest('SHA-256', msgUint8);

    // SHA-256ハッシュの計算結果(hashBuffer)はArrayBufferなので、
    // それをUint8Arrayに変換し、16進数の文字列に変換する
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    // ----------パスワードをハッシュ値に書き換えて送信---------------
    password.value = hashHex;
    form.submit();
    //e.submit();

  });


}

main()