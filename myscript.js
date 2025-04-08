// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyCqJUpVX0MYS5ZFl4Ji6JF6WHQyMwMR1xE",
    authDomain: "studentinfo-621f6.firebaseapp.com",
    databaseURL: "https://studentinfo-621f6-default-rtdb.firebaseio.com",
    projectId: "studentinfo-621f6",
    storageBucket: "studentinfo-621f6.appspot.com",
    messagingSenderId: "917260810120",
    appId: "1:917260810120:web:42ccf14db52b9658ddec3d"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);



var nameV, courseV, statusV;

// Function to read form input
function readForm() {
    nameV = document.getElementById("name").value;
    courseV = document.getElementById("course").value;
    statusV = document.getElementById("status").value;
    console.log(nameV, courseV, statusV);
}

// Insert new student data
document.getElementById("insert").onclick = function () {
    readForm();
    var studentRef = firebase.database().ref("student").orderByChild("name").equalTo(nameV);
    studentRef.once("value").then(function(snapshot) {
        if (snapshot.exists()) {
            alert("This student is already on the list.");
        } else {
            var newStudentRef = firebase.database().ref("student").push();
            newStudentRef.set({
                name: nameV,
                course: courseV,
                status: statusV
            });
            alert("Data Inserted");
            clearForm();
        }
    });
};

// Read student data by name
document.getElementById("read").onclick = function () {
    readForm();
    firebase.database().ref("student").orderByChild("name").equalTo(nameV).once("value")
        .then(function(snapshot) {
            var data = snapshot.val();
            if (data) {
                for (var key in data) {
                    var student = data[key];
                    document.getElementById("course").value = student.course;
                    document.getElementById("status").value = student.status;
                }
                alert("Data Retrieved");
            } else {
                alert("No student found with the provided name.");
            }
        })
        .catch(function(error) {
            console.error("Error retrieving data: ", error);
        });
};

// Update student data
document.getElementById("update").onclick = function () {
    readForm();
    firebase.database().ref("student").orderByChild("name").equalTo(nameV).once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(data) {
                data.ref.update({
                    course: courseV,
                    status: statusV
                });
            });
            alert("Data Updated");
            clearForm();
        });
};

// Delete student data
document.getElementById("delete").onclick = function () {
    readForm();
    firebase.database().ref("student").orderByChild("name").equalTo(nameV).once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(data) {
                data.ref.remove();
            });
            alert("Data Deleted");
            clearForm();
        });
};

// Show all students in a table
document.getElementById("showStudents").onclick = function () {
    clearForm();
    document.getElementById("studentTableBody").innerHTML = "";
    var studentRef = firebase.database().ref("student");
    studentRef.once("value", function(snapshot) {
        var students = snapshot.val();
        if (students) {
            var tableBody = document.getElementById("studentTableBody");
            for (var id in students) {
                var student = students[id];
                var row = tableBody.insertRow();
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = student.name;
                cell2.innerHTML = student.course;
                cell3.innerHTML = student.status;
            }
        } else {
            alert("No student records found.");
        }
    });
};

// Export student data to Excel
document.getElementById("exportToExcel").onclick = function () {
    var table = document.getElementById("studentTableBody");
    var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, "students.xlsx");
};

// Clear the form fields
function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("course").value = "";
    document.getElementById("status").value = "";
}

// Import student data from CSV file
document.getElementById("importData").onclick = function () {
    var fileInput = document.getElementById("importFile");
    if (fileInput.files.length === 0) {
        alert("Please select a file to import.");
        return;
    }
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
        var csvData = e.target.result;
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: function (results) {
                var students = results.data;
                students.forEach(function (student) {
                    if (student.name && student.course && student.status) {
                        var newStudentRef = firebase.database().ref("student").push();
                        newStudentRef.set({
                            name: student.name,
                            course: student.course,
                            status: student.status
                        });
                    }
                });
                alert("Data imported successfully!");
            },
            error: function (error) {
                console.error("Error parsing CSV:", error);
                alert("There was an error processing the file.");
            }
        });
    };

    reader.onerror = function (error) {
        console.error("Error reading file:", error);
        alert("There was an error reading the file.");
    };

    reader.readAsText(file);
};
