function genRandonString() {
  let chars = 'abcdefghijklmnopqrstuvwxyz123456789';
  let charLength = chars.length;
  let result = '';
  for ( var i = 0; i < 6; i++ ) {
     result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

console.log(genRandonString());
