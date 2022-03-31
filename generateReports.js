//import createFile from 'create-file';
//var fs = require('fs');

import { channels } from '../shared/constants';
import { jsPDF } from "jspdf";
const {ipcRenderer} = window.require("electron")

/*  GenerateReports
    Checklist-
        - Create writeReports function that will generate the report (Notes below)
            - Plugins exist, but only to write to a TXT file
            - We could remove the delete permission on the TXT files for recovery sake
            - New file is not made when button is pressed
        [IN PROGRESS] Create validation to let user know if a report was sucessfully created or not
        [DONE!] Output the right date range to the console as visual feedback
    Function Pseudocode-
        - Obtain user input through event variable
        - Depending on the radio button checked:
            - Set start date for report range (current date?)
            - Calculate end date for report range (I.E. weekly -> sunday to sunday)
            - Obtain either donations or expenses FROM THAT RANGE ONLY
            -Compile them into an array and use it to process
        - Open connection to Google Drive File
        - Write reports using the donations/expenses
*/
let timeSelected = "None Specified";
let currentDate = new Date();
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var currentMonth = month[currentDate.getMonth()];
function calculateTimeframe() {
    let input = document.getElementsByClassName("timeframe");
    let el = document.getElementById("selectedTime");
    let text;
    //Part one: Obtain current button checked
    for (let x = 0; x < input.length; x++) {
        let currentEl = input[x];
        if (currentEl.checked) {
            timeSelected = input[x].value;
        }
    }
    //Part Two: Calculate current timeframe and set timeSelected
    //Sunday to saturday
    if (timeSelected === "Weekly") {
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var first = currentDate.getDate() - currentDate.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        //Code for the first day of the week (Example format: Sunday, Jan XX, 2022)
        var firstDay = new Date(y, m, first)
        var firstString = firstDay.toLocaleString([], { dateStyle: 'long' });
        var firstWeekday = weekday[firstDay.getDay()]
        //Code for the last dy of the week (Example format: Saturday, Jan XX, 2022)
        var lastDay = new Date(y, m, last)
        var lastString = lastDay.toLocaleString([], { dateStyle: 'long' });
        var lastWeekday = weekday[lastDay.getDay()]
        //Tell the page what to render
        text = firstWeekday + ", " + firstString + " - " + lastWeekday + ", " + lastString;
    }
    //1st day of month - last day of month
    else if (timeSelected === "Monthly") {
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        //Obtain first and last days of the month
        var firstDay = new Date(y, m, 1).toLocaleString([], { dateStyle: 'long' });
        var lastDay = new Date(y, m + 1, 0).toLocaleString([], { dateStyle: 'long' });
        //Tell the page what to render
        text = firstDay + " - " + lastDay;
    }
    //Quarter 1,2,3,4 hard-coded because quarters never change
    else if (timeSelected === "Quarterly") {
        //Quarter One
        if (currentMonth === "January" || currentMonth === "Febuary" || currentMonth === "March") {
            text = "Quarter One";
        }
        //Quarter 2
        else if (currentMonth === "April" || currentMonth === "May" || currentMonth === "June") {
            text = "Quarter Two";
        }
        //Quarter 3
        else if (currentMonth === "July" || currentMonth === "August" || currentMonth === "September") {
            text = "Quarter Three";
        }
        //Quarter 4
        else if (currentMonth === "October" || currentMonth === "November" || currentMonth === "December") {
            text = "Quarter Four";
        }

    }
    //Display all Donations or Expenses for the current year
    else if (timeSelected === "Yearly") {
        let currentYear = currentDate.getFullYear();
        text = "All of " + currentYear;
    }
    //Display Specified Date Range
    else if (timeSelected === "Custom") {


    }
    //Part Three: Display current timeframe slected
    el.style.animation = "fadeDiv 1s";
    el.textContent = text;
    el.style.animation = "restoreDiv 1s";
    el.style.animation = " ";
}

function allowDateRangeSelection()
{
    document.getElementById('customRange').style.display = "block";
}

function calculateCustomTimeframe()
{
    console.log('User has selected Custom Date Range.');
}

function writeReport(event) {
    event.preventDefault();
    console.log("GENERATING REPORTS");

    var donationReport1 = document.getElementById("donationType1");
    var donationReport2 = document.getElementById("donationType2");
    var expense = document.getElementById("expense");

    if(donationReport1.checked)
    {
        console.log('User selected donationType1');
        document.getElementById('viewDonationType1').style.display = "block";
        document.getElementById('generatePDF').style.display = "block";

        document.getElementById('viewDonationType2').style.display = "none";
        document.getElementById('viewExpense').style.display = "none";
        document.getElementById('undefinedReport').style.display = "none";
    }
    else if(donationReport2.checked)
    {
        console.log('User selected donationType2');
        document.getElementById('viewDonationType2').style.display = "block";
        document.getElementById('generatePDF').style.display = "block";

        document.getElementById('viewDonationType1').style.display = "none";
        document.getElementById('viewExpense').style.display = "none";
        document.getElementById('undefinedReport').style.display = "none";
    }
    else if(expense.checked)
    {
        console.log('User selected expense');
        document.getElementById('viewExpense').style.display = "block";
        document.getElementById('generatePDF').style.display = "block";

        document.getElementById('viewDonationType1').style.display = "none";
        document.getElementById('viewDonationType2').style.display = "none";
        document.getElementById('undefinedReport').style.display = "none";
    }
    else
    {
        console.log('User did not select a donation or expense report');
        document.getElementById('undefinedReport').style.display = "block";

        document.getElementById('viewDonationType1').style.display = "none";
        document.getElementById('viewDonationType2').style.display = "none"; 
        document.getElementById('viewExpense').style.display = "none"; 
    }
}

function savePDF(){
    var today = new Date();
    var date = (today.getMonth()+1)+'-'+today.getDate()+'-'+today.getFullYear();
    var filename = 'report ' + date + '.pdf';

    var doc = new jsPDF("p","pt", "a4");
    
    var donationReport1 = document.getElementById("donationType1");
    var donationReport2 = document.getElementById("donationType2");
    var expense = document.getElementById("expense");

    if(donationReport1.checked)
    {
        console.log('Saving donationType1');
        doc.html(document.getElementById("viewDonationType1"), {
            callback: function (doc) 
            {
                doc.save(filename);
            },
            x: 20,
		    y: 20
        });
    }
    else if(donationReport2.checked)
    {
        console.log('Saving donationType2');
        doc.html(document.getElementById("viewDonationType2"), {
            callback: function (doc) 
            {
                doc.save(filename);
            },
            x: 20,
		    y: 20
        });
    }
    else if(expense.checked)
    {
        console.log('Saving selected expense');
        doc.html(document.getElementById("viewExpense"), {
            callback: function (doc) 
            {
                doc.save(filename);
            },
            x: 20,
		    y: 20
        });
    }
    else
    {
        console.log('Not saving a donation or expense report');
    }
}

function GenerateReports() {
    return (
        <div id="reports">
            <h1>Generate a Report</h1>
            <form onSubmit={writeReport}>
                <div id="specifiedDate">
                    <p>Specified Date Range:</p>
                    <p id="selectedTime">{timeSelected}</p>
                </div>
                <div>
                    <p>Desired Time Frame</p>
                    <div>
                        <input type='radio' name="time" value="Weekly" className="timeframe" id="weekly" onClick={calculateTimeframe} />
                        <label htmlFor="weekly">Weekly</label>
                    </div>
                    <div>
                        <input type='radio' name="time" value="Monthly" className="timeframe" id="monthly" onClick={calculateTimeframe} />
                        <label htmlFor="monthly">Monthly</label>
                    </div>
                    <div>
                        <input type='radio' name="time" value="Quarterly" className="timeframe" id="quarterly" onClick={calculateTimeframe} />
                        <label htmlFor="quarterly">Quarterly</label>
                    </div>
                    <div >
                        <input type='radio' name="time" value="Yearly" className="timeframe" id="yearly" onClick={calculateTimeframe} />
                        <label htmlFor="yearly">Yearly</label>
                    </div>
                    <div id="lastDiv">
                        <input type='radio' name="time" value="Custom" className="timeframe" id="custom" onClick={allowDateRangeSelection} />
                        <label htmlFor="custom">Custom</label>
                    </div>
                    <div id="customRange" style={{display:"none"}}>
                        <input type='date' name="time" value="Custom" className="timeframe" id="customStart" />
                        <label htmlFor="custom">Start Time</label>
                        <input type='date' name="time" value="Custom" className="timeframe" id="customEnd" onClick={calculateCustomTimeframe} />
                        <label htmlFor="custom">End Time</label>
                    </div>

                    <p>Desired Report Type</p>
                    <div>
                        <input type='radio' name="type" id="donationType1" />
                        <label htmlFor="donation">For Income Tax</label>
                    </div>
                    <div>
                        <input type='radio' name="type" id="donationType2" />
                        <label htmlFor="donation">General Totals</label>
                    </div>
                    <div>
                        <input type='radio' name="type" id="expense" />
                        <label htmlFor="expense">Expenses</label>
                    </div>
                </div>
                <input type="submit" value="submit"></input>
            </form>
            <div id = "viewDonationType1" style={{display:"none"}}>
                <h3>Statement of Contribution for Income Tax Purposes</h3>
                <p>The official body of New Covenant Church</p>
                <p>City of Rock Hill, County of York, State of South Carolina</p>
                <p>states that $donator_name contributed $donation_sum</p>
                <p>to the above named church in the year of our Lord ending $donation_year.</p>
                <p></p>
                <table>
                <tr>
                    <th>_________________</th>
                    <th>_________________</th>
                    <th>_________________</th>
                </tr>
                <tr>
                    <td align = "center">Treasurer</td>
                    <td align = "center">Secretary/Clerk</td>
                    <td align = "center">Pastor</td>
                </tr>
                </table>
                <p>$date_day of $date_month month $date_year year</p>
            </div>
            <div id = "viewDonationType2" style={{display:"none"}}>
                <p>$date</p>
                <h3>Statement</h3>
                <p>Weeping Mary Baptist Church</p>
                <p>1996 Eastview Rd</p>
                <p>Rock Hill, SC, 29731</p>
                <br />
                <p>$donation_category for</p>
                <p>$donation_year for</p>
                <p>$donation_sum</p>
                <br />
                <p>Financial Secretary</p>
            </div>
            <div id = "viewExpense" style={{display:"none"}}>
                <p>$date</p>
                <h3>Statement</h3>
                <p>$expense_category</p>
                <p>$expense_sum for</p>
                <p>$expense_timeframe</p>
                <br />
                <p>Financial Secretary</p>
            </div>
            <div id = "generatePDF" style={{display:"none"}}>
                <button id="cmd" onClick={savePDF}>Generate PDF</button>
            </div>
            <div id = "undefinedReport" style={{display:"none"}}>
                <p>Please select a Desired Report Type</p>
            </div>
        </div>
    );
}

export default GenerateReports;
