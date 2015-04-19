window.onload = function () {
    var form = document.getElementById('saveform'),
        primaryselect = document.getElementById('primaryStream'),
        secondaryselect = document.getElementById('secondaryStream'),
        open_in = document.getElementById('newtab'),
        user_info = get_user_info() || {};

    // initialize the form data to either localstorage data or defaults
    primaryselect.value = user_info.service || 'spotify';
    secondaryselect.value = user_info.secondary_service || 'spotify';
    open_in.checked = user_info.open_in == 'new' ? true : false;

    form.onsubmit = function (ev) {
        // update user info and save it to localstorage
        user_info.service = primaryselect.value;
        user_info.secondary_service = secondaryselect.value;
        user_info.open_in = open_in.checked ? 'new' : 'current';
        set_user_info(user_info)
        return false;
    }
}
