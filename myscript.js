document.getElementById("showStudents").onclick = function () {

  document.getElementById("roll").value = "";
  document.getElementById("name").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("address").value = "";

  var studentRef = firebase.database().ref("student");


  studentRef.once("value", function (snapshot) {
    var students = snapshot.val();
    if (students) {
   
      for (var rollNo in students) {
        var student = students[rollNo];
        console.log(student);
    
        var studentList = document.getElementById("studentList");
        var studentInfo = document.createElement("div");
        studentInfo.innerHTML = `
          Roll No: ${student.rollNo}<br>
          Name: ${student.name}<br>
          Gender: ${student.gender}<br>
          Address: ${student.address}<br><br>
        `;
        studentList.appendChild(studentInfo);
      }
    } else {
      alert("No student records found.");
    }
  });
};


document.getElementById("showStudents").onclick = function () {
  // Clear the existing data in the table
  document.getElementById("studentTableBody").innerHTML = "";

  var studentRef = firebase.database().ref("student");

  studentRef.once("value", function (snapshot) {
    var students = snapshot.val();
    if (students) {
      var studentTableBody = document.getElementById("studentTableBody");

      for (var studentID in students) {
        var student = students[studentID];

      
        var row = studentTableBody.insertRow();

    
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

    
        cell1.innerHTML = studentID;
        cell2.innerHTML = student.name;
        cell3.innerHTML = student.gender;
        cell4.innerHTML = student.address;
      }
    } else {
      alert("No student records found.");
    }
  });
};




var rollV, nameV, genderV, addressV;

function readFom() {
  rollV = document.getElementById("roll").value;
  nameV = document.getElementById("name").value;
  genderV = document.getElementById("gender").value;
  addressV = document.getElementById("address").value;
  console.log(rollV, nameV, addressV, genderV);
}

document.getElementById("insert").onclick = function () {
  readFom();

  var studentRef = firebase.database().ref("student/" + rollV);

  studentRef.once("value").then(function(snapshot) {
    if (snapshot.exists()) {
      alert("This student is already on the list.");
    } else {
      firebase
        .database()
        .ref("student/" + rollV)
        .set({
          rollNo: rollV,
          name: nameV,
          gender: genderV,
          address: addressV,
        });
      alert("Data Inserted");
      document.getElementById("roll").value = "";
      document.getElementById("name").value = "";
      document.getElementById("gender").value = "";
      document.getElementById("address").value = "";
    }
  });
};


document.getElementById("read").onclick = function () {
  readFom();

  firebase
    .database()
    .ref("student/" + rollV)
    .once("value")
    .then(function (snapshot) {
      var studentData = snapshot.val();
      if (studentData) {
        document.getElementById("roll").value = studentData.rollNo;
        document.getElementById("name").value = studentData.name;
        document.getElementById("gender").value = studentData.gender;
        document.getElementById("address").value = studentData.address;
      } else {
        alert("No student found with the provided Student ID.");
      }
    })
    .catch(function (error) {
      console.error("Error retrieving data: " + error);
    });
};

document.getElementById("update").onclick = function () {
  readFom();

  firebase
    .database()
    .ref("student/" + rollV)
    .update({
  
      name: nameV,
      gender: genderV,
      address: addressV,
    });
  alert("Data Update");
  document.getElementById("roll").value = "";
  document.getElementById("name").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("address").value = "";
};
document.getElementById("delete").onclick = function () {
  readFom();

  firebase
    .database()
    .ref("student/" + rollV)
    .remove();
  alert("Data Deleted");
  document.getElementById("roll").value = "";
  document.getElementById("name").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("address").value = "";
};

