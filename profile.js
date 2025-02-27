document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/login')
    .then(res => {
        if (res.status !== 200) {
            alert(`Usuário sem login`);
            res.redirect('/login');
        }
        return res.json();
    })
        .then(data => {
            document.getElementsByClassName(`name-user`).textContent = data.name;
            document.getElementsByClassName(`email-user`).textContent = data.email;
        })
    .catch(err => {
        console.log(err);
    })

});