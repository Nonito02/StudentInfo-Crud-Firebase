document.getElementById("importData").onclick = function () {
  // Get the file input
  var fileInput = document.getElementById("excelFile");
  
  // Check if a file is selected
  if (fileInput.files.length === 0) {
    alert("Please select an Excel file to import.");
    return;
  }
  
  // Get the selected file
  var file = fileInput.files[0];

  // Use FileReader to read the Excel file
  var reader = new FileReader();
  
  reader.onload = function (e) {
    var data = e.target.result;
    
    // Parse the Excel data using the xlsx library
    var workbook = XLSX.read(data, { type: 'binary' });

    // Get the first sheet (assuming data is in the first sheet)
    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert the sheet to JSON
    var excelData = XLSX.utils.sheet_to_json(firstSheet);
    
    // Now we have the data as JSON, insert it into Firebase
    var studentRef = firebase.database().ref("students");

    // Iterate over the rows in the excelData
    excelData.forEach(function (student) {
      // Assuming the Excel columns are "Full Name", "Course", and "Status"
      if (student['Full Name'] && student['Course'] && student['Status']) {
        var newStudentRef = studentRef.push();
        newStudentRef.set({
          name: student['Full Name'],
          course: student['Course'],
          status: student['Status']
        });
        
        // Display in the table
        var tableBody = document.getElementById("studentTableBody");
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0); // Full Name
        var cell2 = row.insertCell(1); // Course
        var cell3 = row.insertCell(2); // Status

        cell1.innerHTML = student['Full Name'];
        cell2.innerHTML = student['Course'];
        cell3.innerHTML = student['Status'];
      }
    });

    alert("Data imported successfully!");
  };

  reader.onerror = function (error) {
    console.error("Error reading file:", error);
    alert("There was an error reading the file.");
  };

  reader.readAsBinaryString(file); // Read the file as a binary string
};
