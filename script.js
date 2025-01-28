document.addEventListener('DOMContentLoaded', function () {
    const box = document.querySelector('.box');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
  
    registerBtn.addEventListener('click', () => {
        box.classList.add("active");
    });
  
    loginBtn.addEventListener('click', () => {
        box.classList.remove("active");
    });
  });