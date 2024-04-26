const url = import.meta.env.VITE_APP_API_URL+'/api';

const handleErrors = async (response) => {
  return response.json();
};

// --------------- post request ---------------
const postToServerNoToken = async (urlPath, body = {}) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(body),
  };
  try {
    const response = await fetch(`${url}/${urlPath}`, requestOptions);
    // console.log(response);
    const result = await handleErrors(response);
    return result;
  } catch (error) {
    return { status: false, message: "Connection Error" };
  }
};

// --------------- get request ---------------
const getFromServerNoToken = async (urlPath) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  try {
    const response = await fetch(`${url}/${urlPath}`, requestOptions);
    const result = await handleErrors(response);
    return result;
  } catch (error) {
    return { status: false, data: {} };
  }
};

// --------------- post  request ---------------
const postToServer = async (urlPath, body = {}) => {
  const token = localStorage.getItem("accessToken");
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(body),
  };
  // console.log("options", requestOptions);
  try {
    const response = await fetch(`${url}/${urlPath}`, requestOptions);
    const result = await handleErrors(response);
    return result;
  } catch (error) {
    return { status: false, message: "Some error occured" };
  }
};

// --------------- put request ---------------
const putToServer = async (urlPath, body = {}) => {
  const token = localStorage.getItem("accessToken");
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: JSON.stringify(body),
  };
  try {
    const response = await fetch(`${url}/${urlPath}`, requestOptions);
    const result = await handleErrors(response);
    return result;
  } catch (error) {
    return { status: false, data: {} };
  }
};

// --------------- put request ---------------
const patchToServer = async (urlPath, body = {}) => {
  const token = localStorage.getItem("accessToken");
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: JSON.stringify(body),
  };
  // console.log("options", requestOptions.body);
  try {
    const response = await fetch(`${url}/${urlPath}`, requestOptions);
    const result = await handleErrors(response);
    return result;
  } catch (error) {
    // console.log("error", error);
    return { status: false, data: {} };
  }
};

// --------------- delete request ---------------
const deleteFromServer = async (urlPath) => {
  const token = localStorage.getItem("accessToken");
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  var requestOptions = {
    method: "DELETE",
    headers: myHeaders,
  };
  try {
    const response = await fetch(`${url}/${urlPath}`, requestOptions);
    const result = await handleErrors(response);
    return result;
  } catch (error) {
    return { status: false, message: "Some error occured" };
  }
};

// --------------- get request ---------------
const getFromServer = async (urlPath) => {
  const token = localStorage.getItem("accessToken");

  // console.log("my token", token.access);

  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  const response = await fetch(`${url}/${urlPath}`, requestOptions);
  if(urlPath == 'notifications'){
    const result = response.json();
    return result
  }
  else{
    const result = await handleErrors(response);
    return result;
  }
};

const getFromServerByParameterToken = async (urlPath, token) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  const response = await fetch(`${url}/${urlPath}`, requestOptions);
  if(urlPath == 'notifications'){
    const result = response.json();
    return result
  }
  else{
    const result = await handleErrors(response);
    return result;
  }
};

const getFromServerHardToken = async (urlPath) => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIxMjEzODAsImlzcyI6Imh0dHBzOi8vYXBpLmdldGpvYmJlci5jb20iLCJjbGllbnRfaWQiOiIyMzFhMjE1Zi1mNTFjLTRiOTItYjc0ZC02N2M2NGM2NTMzZmEiLCJzY29wZSI6InJlYWRfY2xpZW50cyByZWFkX3JlcXVlc3RzIHJlYWRfcXVvdGVzIHJlYWRfam9icyByZWFkX3NjaGVkdWxlZF9pdGVtcyByZWFkX2ludm9pY2VzIHJlYWRfam9iYmVyX3BheW1lbnRzIHJlYWRfdXNlcnMgcmVhZF9leHBlbnNlcyByZWFkX2N1c3RvbV9maWVsZF9jb25maWd1cmF0aW9ucyByZWFkX3RpbWVfc2hlZXRzIiwiYXBwX2lkIjoiMjMxYTIxNWYtZjUxYy00YjkyLWI3NGQtNjdjNjRjNjUzM2ZhIiwidXNlcl9pZCI6MjEyMTM4MCwiYWNjb3VudF9pZCI6MTEyMjkxMCwiZXhwIjoxNzAzODczMjQwfQ.O4_LlFDQgWGTPT27sb5R0swgmbREvp9xJjdp0kaFFA4'
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", `application/json`);
  myHeaders.append("Accept", `*/*`);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  const response = await fetch(`${url}/${urlPath}`, requestOptions);
  if(urlPath == 'notifications'){
    const result = response.json();
    return result
  }
  else{
    const result = await handleErrors(response);
    return result;
  }
};

// --------------- form data request ---------------
const formdataToServer = async (urlPath, method, formData) => {
  const token = JSON.parse(localStorage.getItem("authUser"));
  // console.log("tokenassssss", token);
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token?.access}`);
  var requestOptions = {
    method: method,
    headers: myHeaders,
    body: formData,
  };
  try {
    const response = await fetch(`${url}/${urlPath}`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    // console.log(2, error);
    return { status: false, data: {} };
  }
};

export {
  deleteFromServer,
  formdataToServer,
  getFromServer,
  getFromServerNoToken,
  patchToServer,
  postToServer,
  postToServerNoToken,
  putToServer,
  getFromServerHardToken,
  getFromServerByParameterToken
};
