/* Add Donations Page
    External Input:
        -MenuBar- controls navigation for the site
    Functions: 
        - RenderDonation (adds a number of donation lines specified by the user)
        - handleDonations (rediredcts the screen to /donations)
        - goAddExpenses (redirects the screen to /addExpenses)
    Output:
        a div containing the HTML content sent to App.js
*/
import React from 'react';
import ReactDOM from 'react-dom';
import MenuBar from './menu.js';
import { channels } from '../shared/constants';
const {ipcRenderer} = window.require("electron")


/* Function name: handleDonations
    Precondition(s)-
        - No donations currently exist in the database OR
        - Donations currently exist in the database (add on to the donations that already exist)
    Postcondition(s)-
        - A user specified number of donations are entered into the correct database table as a SQL query
        - A confirmation alert has appeared to notify the user if the data went into the database or not
    Pseudocode-
        - Figure out how to handle the "key" property on divs in the form element (For the Database)
        - Get all the user inputs from the form on this page
        - Parse user inputs and order them according to database schema
        - Check to make sure there are no missing values (user input validation so the query doesnt break)
        - Assemble SQL query with user inputs as values
 */
//Backend handling
function handleDonations(event){
    //window.location.hash="/donations";
    //here!!crystal
    let numDonations=document.getElementsByName("donationCount")[0].value;
    let arg=true
    for (let x=0; x<numDonations; x++){
        console.log(arg);
        arg = ipcRenderer.sendSync(channels.ADD_DONATION, event.target[0 + x*7].value,event.target[1 + x*7].value, event.target[2 + x*7].value,event.target[3 + x*7].value, event.target[4 + x*7].value, event.target[5 + x*7].value, event.target[6 + x*7].value);
    }
    if (arg === true){
        ipcRenderer.send(channels.GET_DONATION);
        window.location.hash="/donations";
    } 
    else{
        event.preventDefault();
        console.log("ERROR")
    }

}

//Routing purposes
function goAddExpenses(){
    window.location.hash="/addExpenses";
}
let index = 0;
ipcRenderer.send(channels.GET_CATS_DONATION);
let cats=[];
ipcRenderer.on(channels.GET_CATS_DONATION, (event,arg) => {
    cats = arg;
    console.log(cats);
});

/*  Function name: addMoreDonations
    Precondition(s)-
        - A button for the user to enter the amount of donations exists
    Postcondition(s)-
        - For each donation the user wants to add, a new unique div element is created and inserted into the form element
    Input(s)-
        - event: the current number of specified donations from the user
    Pseudocode-
        - On submit, the page is prevented from moving forward
        - The number of donations specified is stored in a variable numDonations
        - A variable index is used to keep track of the div element's "key" attribute (this causes a bug where the key resets to 0 every time though)
        - A variable additionalDonations contains all the HTML for the additional donation
        - For each new donation the user wants to display, a copy of additionalDonations is stored in an array named donationHTML
        - All additional donations are rendered to the current page
*/
function addMoreDonations(event) {
    event.preventDefault();
    console.log(cats);
    var select = document.createElement("select");
    console.log(select);
    function generateSelect(){
    for(var i = 0; i < cats.length; i++) {
        var opt = cats[i];

        var el = document.createElement("option");
        console.log(el);
        el.text = opt;
        el.value = opt;
    
        select.add(el);
    }
    return select;
    }
    //Get the number of new donations to be handled
    let numDonations = document.getElementsByName("donationCount")[0].value;
    //JSX to be inserted into an array
    let additionalDonations=(<div key={index++}>
        <label htmlFor="date">Date</label>
        <input type='date' name="date"/>
        
        <label htmlFor="donorName">Donor Name</label>
        <input type='text' name="donorName" onBlur={donorNameFormatter} id="donorName"/>
        
        <label htmlFor="amount">Amount  $</label>
        <input type='text' name="amount" onBlur={currencyFormatter} id="amount" />
        
        <label htmlFor="category">Category</label>
            <select id="category" name="category">
                <option value = "NA">Select a Category</option>
                {cats.map((category) => (
                    <option value = {category}> {category} </option>
                ))}
            </select>
            
        <label htmlFor="payMeth">Payment Method</label>
        <input type='text' name="payMeth"/>
        
        <label htmlFor="phoneNumber">Phone Number</label>
        <input type = 'text' name="phoneNumber" input onKeyDown={phoneNumberFormatter} id="phoneNumber" maxLength="14"/>
        
        <label htmlFor="address">Address</label>
        <input type='text' name="address" onBlur={addressFormatter} id="address"/>
        
    </div>);
    //Array of all new empty donations to be added to the page
    let donationHTML = [];
    //Adds html to the array each time x is <= the number of donations
    if (numDonations >= 1 && numDonations <= 500) {
        for (let x = 0; x < numDonations; x++) {
            donationHTML.push(additionalDonations);
        };
    }
    console.log("Complete Rendered HTML for additional donations: " + donationHTML);
    ReactDOM.render(donationHTML, document.getElementById('addDonationsHere'));
}

function goCatePage(){
    window.location.hash = "/editCats";
}

/* 
 * formatting donor name to be alpha only [2 functions]
 * donorNameFormatter(event)
 * formatDonorName(nameValue)
 */
function donorNameFormatter(event)
{
    let inputFieldFormat = formatDonorName(event.target.value);
    event.target.value = inputFieldFormat;
}

function formatDonorName(nameValue)
{
    var alphaExp = /^[a-zA-Z' \-]+$/;
    if (nameValue.match(alphaExp))
    {
        return nameValue.toString();
    }
    else
    {
        nameValue = 'Invalid. Enter donor name';
        return nameValue;
    }
}

/*
 * formatting amount to just have two decimal places [2 functions]
 * currencyFormatter(event)
 * formatCurrency(currencyValue, decimalPlace)
 */
 
function currencyFormatter(event)
{
  let inputFieldFormat = formatCurrency(event.target.value,2);
  let checkIfNum = Number(inputFieldFormat);
  if (isNaN(checkIfNum))
  {
    event.target.value = 'Enter an amount';
  }
  else
  {
    event.target.value = inputFieldFormat;
  }
}

function formatCurrency(currencyValue, decimalPlace)
{
    let currencyOutput = currencyValue.replace(/[^0-9.]/g, '');
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (decimalPlace || -1) + '})?');
    return currencyOutput.toString().match(re)[0];
}

/* 
 * formatting phone number [2 functions]
 * phoneNumberFormatter(event)
 * formatPhoneNumber(value)
 */
function phoneNumberFormatter(event)
{
  let inputFieldFormat = formatPhoneNumber(event.target.value);
  event.target.value = inputFieldFormat;
  console.log("This is phone number field output: " + inputFieldFormat);
}

function formatPhoneNumber(value) {
    // if input value is falsy [if the user deletes the input], return
    if (!value) return value;
  
    // clean input - digits only
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
  
    // return the value with no formatting if less than four digits
    // avoids formatting area code too soon
    if (phoneNumberLength < 4) return phoneNumber;
  
    // if phoneNumberLength is 4 < x < 7, start to return formatted number
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
  
    // if the phoneNumberLength > seven, add formatting and return
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  }

  /* 
   * formatting address to be alphanumerical only [2 functions]
   * addressFormatter(event)
   * formatAddress(addressValue)
   */ 
function addressFormatter(event)
{
    let inputFieldFormat = formatAddress(event.target.value);
    event.target.value = inputFieldFormat;
}

function formatAddress(addressValue)
{
    var alphaExp = /^[0-9a-zA-Z \.\-]+$/;
    if (addressValue.match(alphaExp))
    {
        return addressValue.toString();
    }
    else
    {
        addressValue = 'Invalid. Enter address';
        return addressValue;
    }
}

function AddDonations() {
    //renders HTML content

    return (
        <div id="addDonations">

            <h1>Add Donations</h1>
            <form id="addDonations" method="post" onSubmit={handleDonations}>
                <div id="addDonationsHere"></div>
                <div>
                    <label htmlFor="donationCount">How many donations do you have?</label>
                    <input type='number' name='donationCount' max="500" min="1" required />
                    <button id="addDonationButton" onClick={addMoreDonations}>+ Add More Donations</button>
                </div>
                <button onClick={goAddExpenses} name="action" value="addExpense" id="addExpenseButton">+ Add Expenses</button>
                <button id="submitButton" type="submit" name="action" value="submit">Submit</button>
            </form>
            <button onClick={goCatePage}>Need to edit the categories?</button>
        </div>
    );
  }
  
  export default AddDonations;
