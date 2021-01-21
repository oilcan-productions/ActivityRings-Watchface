
// log uploader
const APP_ID = "6176a01a-b03d-40fa-b847-e08953f8dffc";
export function uploadFile(data) {
    fetch("https://file.io", {
    body: `text=${escape(JSON.stringify(data))}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  })
  .then(function(response) {
    return response.json();
  }).then(function(data) {
    console.log(`Created ${file}: ${JSON.stringify(data)}`);
  });
}
