

// ログイン、サインイン画面、パスリセット画面　フォーム送信時にパスワードをハッシュ化してから送信
let hash_form = document.getElementById('hash-form');
let origin_password = document.getElementById('origin_password');


var hash_submit = document.getElementById('hash_submit');


hash_submit.addEventListener('click', function() {
  const algo = "SHA-256";
  const str = origin_password.value;
  let hex;
  // generate hash!
  crypto.subtle.digest(algo, new TextEncoder().encode(str)).then(x => {
    //hex = hexString(x); // convert to hex string.
    hex = x;
    form.elements['hash_pass'].value = hex;
    form.elements['user_pass'].value = "";

    form.submit();
  });


  
})



// パスワードをハッシュ値に変換する
function hexString(buffer) {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map(value => {
    const hexCode = value.toString(16);
    const paddedHexCode = hexCode.padStart(2, '0');
    return paddedHexCode;
  });
  return hexCodes.join('');
}

