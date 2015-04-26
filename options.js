window.onload = function () {
    var save_btn = document.getElementById('savebtn'),
        close_btn = document.getElementById('closebtn'),
        primaryselect = document.getElementById('primaryStream'),
        open_in = document.getElementById('newtab'),
        user_info = get_user_info() || {};

    // initialize the form data to either localstorage data or defaults
    primaryselect.value = user_info.service;
    open_in.checked = user_info.open_in == 'new' ? true : false;

    close_btn.addEventListener('click', function (ev) {
        window.close();
    });

    save_btn.addEventListener('click', function (ev) {
        // update user info and save it to localstorage
        user_info.service = primaryselect.value;
        user_info.open_in = open_in.checked ? 'new' : 'current';
        set_user_info(user_info)
        save_btn.innerHTML = 'Saved!';

        // Doesnt work with IE9<
        close_btn.classList.remove('invisible');
       
        return false;
    });
}
