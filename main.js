const scriptURL = 'https://script.google.com/a/macros/francisparker.org/s/AKfycbzqU1pFT8xs-EY1GeMHsYQEQaTnRBeIDDVYX29y0uGQghlLQEEEYXzZs_h4w0im0efL/exec';
/**
 * Handling the onclick for adding to the game piece count
 */
function addGamePiece(e, index) {
    let row = e.parentElement.parentElement;
    let input = row.querySelectorAll('input')[index];
    let v = input.value * 1; // times 1 so it copies the number, and not a reference
    input.value = Math.min(input.max, v + 1);
}

/**
 * Handling the onclick for subtracting to the game piece count
 */
function subtractGamePiece(e, index) {
    let row = e.parentElement.parentElement;
    let input = row.querySelectorAll('input')[index];
    let v = input.value * 1; // times 1 so it copies the number, and not a reference
    input.value = Math.max(input.min, v - 1);
}

/**
 * Handles the onclick for setting the hidden input for the qualitative value
 */
function setQualitative(e) {
    let q_row = e.parentElement;
    let input = q_row.querySelector('input');
    let value = e.getAttribute('value');
    input.value = value;
    //styling
    let before = true;
    [...q_row.querySelectorAll('div')].forEach((input) => {
        input.className = 'star';
        if (e.value == -1) return;
        if (before) {
            input.className = 'star starred';
        }
        if (input == e) {
            before = false;
        }
    });
}

/**
 * Function to delete inputs upon submission
 */
function clearInputs() {
    [...document.querySelectorAll('input')].forEach((input) => {
        let name = input.name;
        if (!['ScoutName', 'ScoutTeamNum', 'TeamNumScouted', 'MatchNum', 'NoShow'].includes(name)) {
            if (input.type == 'text') {
                input.value = '';
            }
            if (input.type == 'number') {
                input.value = 0;
            }
            if (input.type == 'checkbox') {
                input.checked = false;
            }
        }
    });
}

/**
 * Sets display to none; clears values
 */
function hideInputs() {
    let input = document.querySelector('div.not-no-show');
    input.style = 'display:none';
    clearInputs();
}

/**
 * shows all inputs.
 */
function showInputs() {
    let input = document.querySelector('div.not-no-show');
    input.style = '';
}

/**
 * Used for the NoShow input
 * Clears form elements if NoShow clicked
 */
function noShowToggleHandler(e) {
    let input = document.querySelector('input[name=NoShow]');
    if (input.checked == true) {
        hideInputs();
    } else {
        showInputs();
    }
}

let noShow = document.querySelector('input[name=NoShow]');
noShow.addEventListener('change', noShowToggleHandler);

const form = document.forms['scouting-form'];
function submit(e) {
    e.preventDefault();
    window.data = new FormData(form);
    //checking data
    let name = data.get('ScoutName');
    let teamNumber = data.get('ScoutTeamNum');
    let teamScouted = data.get('TeamNumScouted');
    let matchNumber = data.get('MatchNum');
    if (!name || !teamNumber || !teamScouted || !matchNumber) {
        alert('Please make sure you have provided all information (top 4 fields)');
        return;
    }
    if (!confirm('Are you sure you want to submit?')) {
        return;
    }
    let submitButton = document.querySelector ("#submit")
    submitButton.disabled = true;
    [
        { time: 'auto', cap: 'Auto' },
        { time: 'end', cap: 'End' },
    ].forEach(({ time, cap }) => {
        let chargeInfo = data.get(time + '-charge'); //has value: none, attempted, docked, engaged
        let engagedAttempt = data.get(time + '-engage-attempt');
        //calculating values
        let dockAttempt = chargeInfo == 'attempted';
        let dockSuccess = chargeInfo == 'docked';
        let engagedSuccess = chargeInfo == 'engaged';
        if (engagedSuccess) {
            engagedAttempt = true;
        }
        //setting new values
        data.set(time + '-charge', null);
        data.set(time + '-engage-attempt', null);
        data.set(cap + 'DockAttempt', dockAttempt || dockSuccess || engagedSuccess ? 1 : 0);
        data.set(cap + 'DockSuccess', dockSuccess || engagedSuccess ? 1 : 0);
        data.set(cap + 'EngagedAttempt', engagedAttempt || engagedSuccess ? 1 : 0);
        data.set(cap + 'EngagedSuccess', engagedSuccess ? 1 : 0);
    });
    //adding fields that are empty by default
    ['NoShow', 'AutoEngagedAttempt', 'EndEngagedAttempt', 'PreLoaded', 'Mobility', 'Breakdown'].forEach((name) => {
        console.log(!data.get(name));
        if (!data.get(name)) {
            data.set(name, '0');
        }
    });
    console.log([...data.entries()]);
    fetch(scriptURL, {
        method: 'POST',
        body: data,
    })
        .then((response) => {
            console.log(response);
            if (response.status !== 200) {
                alert('There was a problem submitting... please try again.');
                return;
            }
            alert('Thank you!');
            //resets the form
            submitButton.disabled = false;
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            clearInputs();
            let teamNumScouted = document.querySelector('input[name=TeamNumScouted]');
            teamNumScouted.value = '';
            let matchNum = document.querySelector('input[name=MatchNum]');
            matchNum.value++;
            showInputs();
        })
        .catch((error) => {
            console.log(error);
            alert('There was a problem... please try again and notify the Team 2485 Analytics department if this happens again.');
        });
    setCookie();
}
form.addEventListener('submit', submit);

function setCookie() {
    let formData = new FormData(form);
    let name = formData.get('ScoutName');
    let team = formData.get('ScoutTeamNum');
    document.cookie = encodeURIComponent('name=' + name + ';team=' + team + ';expires=10000000000000000;path=/');
}

function displaySavedData() {
    let scoutName = document.querySelector('input[name=ScoutName]');
    let teamNum = document.querySelector('input[name=ScoutTeamNum]');
    let decodedCoookie = decodeURIComponent(document.cookie);
    for (element of decodedCoookie.split(';')) {
        let [name, value] = element.split('=');
        if (name == 'name') {
            scoutName.value = value;
        } else if (name == 'team') {
            teamNum.value = value;
        }
    }
}

displaySavedData();

//check-super-box code
[...document.querySelectorAll('.check-super-box')].forEach((csb) =>
    csb.addEventListener('click', (e) => {
        let input = csb.querySelector('input');
        input.checked = !input.checked;
        csb.className = input.checked ? 'check-super-box checked' : 'check-super-box';
    })
);
//radio-super-box
document.querySelectorAll('.radio-super-box').forEach((radioSuperBoxes) => {
    let radioButtonBoxes = radioSuperBoxes.children;
    [...radioButtonBoxes].forEach((button) =>
        button.addEventListener('click', (e) => {
            let input = button.querySelector('input');
            input.checked = true;
            [...radioButtonBoxes].forEach((b) => (b.className = ''));
            input.parentElement.className = 'checked';
        })
    );
});
