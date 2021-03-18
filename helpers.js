const FindUserByEmail = function(email,users) {
    let array=Object.values(users)
    for (let i = 0 ; i < array.length; i++){
      if (array[i].email === email){
        console.log(array[i])
        return array[i];
      }
    }
    return false;
  }

module.exports = FindUserByEmail;