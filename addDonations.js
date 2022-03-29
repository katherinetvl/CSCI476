import React from 'react';
import ReactDOM from 'react-dom';
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
function handleDonations(){
    window.location.hash="/donations";
}
//Purpose: redirect the page to /addExpenses on button click
function goAddExpenses(){
    window.location.hash="/addExpenses";
}
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
function addMoreDonations(event){
    event.preventDefault();
    //Get the number of new donations to be handled
    let numDonations=document.getElementsByName("donationCount")[0].value;
    let index=0;
    //JSX to be inserted into an array
    let additionalDonations=(<div key={index++}>
        <label htmlFor="date">Date</label>
        <input type='date' name="date"/>
        <label htmlFor="donorName">Donor Name</label>
        <input type='text' name="donorName" onBlur={donorNameFormatter} id="donorName"/>
        <label htmlFor="amount">Amount  $</label>
        <input type='text' name="amount" onBlur={currencyFormatter} id="amount" />
        <label htmlFor="category">Category</label>
            <select name="category">
                <option value="NA">Select an Option</option>
            </select>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input type = 'text' name="phoneNumber" input onKeyDown={phoneNumberFormatter} id="phoneNumber" maxLength="14"/>
        <label htmlFor="address">Address</label>
        <input type='text' name="address"/>
    </div>);
    //Array of all new empty donations to be added to the page
    let donationHTML=[];
    //Adds html to the array each time x is <= the number of donations
    for(let x =0; x<numDonations; x++){
        donationHTML.push(additionalDonations);
    };
    console.log("Complete Rendered HTML for additional donations: " + donationHTML);
    ReactDOM.render(donationHTML, document.getElementById('addDonationsHere'));
}

// formatting donor name to be alpha only [2 functions]
function donorNameFormatter()
{
    const inputField = document.getElementById('donorName');
    const formattedInputValue = formatDonorName(inputField.value);
    inputField.value = formattedInputValue;
}

function formatDonorName(nameValue)
{
    let formattedInputValue = nameValue.replace(/^[a-zA-Z]+$/g, '');
    return formattedInputValue;
}

// formatting amount to just have two decimal places [2 functions]
function currencyFormatter()
{
  const inputField = document.getElementById('amount');
  const formattedInputValue = formatCurrency(inputField.value,2);
  let checkIfNum = Number(formattedInputValue);
  if (isNaN(checkIfNum))
  {
    inputField.value = 'Enter an amount';
  }
  else
  {
    inputField.value = formattedInputValue;
  }
}

function formatCurrency(currencyValue, decimalPlace)
{
    let currencyOutput = currencyValue.replace(/[^0-9.]/g, '');
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (decimalPlace || -1) + '})?');
    return currencyOutput.toString().match(re)[0];
}

// formatting phone number [2 functions]
function phoneNumberFormatter() // https://tomduffytech.com/how-to-format-phone-number-in-javascript/
{
  const inputField = document.getElementById('phoneNumber');

  // format input with `formatPhoneNumber` function
  const formattedInputValue = formatPhoneNumber(inputField.value);

  // set the value of inputField to formattedValue, generated with 'formatPhoneNumber' function
  inputField.value = formattedInputValue;

  // console.log("This is phone number field output: " + formattedInputValue);
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

function AddDonations() {
    //renders HTML content
    
    return (
        <div id="addDonations">
            
            <h1>Add Donations</h1>
            <form id="addDonations" method="post" onSubmit={handleDonations}>
                <div id="addDonationsHere"></div>     
                <div>
                    <label htmlFor="donationCount">How many donations do you have?</label>
                    <input type='number' name='donationCount'/>
                    <button id="addDonationButton" onClick={addMoreDonations}>+ Add More Donations</button>
                </div>
                <button onClick={goAddExpenses} name="action" value="addExpense" id="addExpenseButton">+ Add Expenses</button>
                <button  id = "submitButton" type="submit" name="action" value="submit">Submit</button>
            </form>
            
        </div>
    );
}



export default AddDonations;
