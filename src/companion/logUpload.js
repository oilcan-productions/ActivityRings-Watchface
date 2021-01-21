
// log uploader
const APP_ID = "6176a01a-b03d-40fa-b847-e08953f8dffc";
export function uploadFile(data) {
  console.log ("Upload this: " + data)
  let jsondata = data; //`text=${escape(JSON.stringify(data))}`;
  // console.log(jsondata);
  // uploadProcess(jsondata);
}

function uploadProcess(jsondata){
  fetch("https://file.io", {
    body: jsondata,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  })
  .then(function(response) {
    //console.log ("got response from file.io: " + response.text());
    return response.json();

  }).then(function(data) {
    console.log(`Created ${file}: ${JSON.stringify(data)}`);
  });
}