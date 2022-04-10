const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileInput");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv= document.querySelector("#percent");

const sharingConatiner = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copy-btn");
const fileURLInput = document.querySelector("#fileURL");

const emailForm = document.querySelector("#emailForm");

const emailContainer = document.querySelector(".email-container");

const toast = document.querySelector(".toast");

const maxAllowedSize = 100 * 1024 * 1024 // 100MB


const host = "https://cloudshare-file-share.herokuapp.com/"
// const host = "http://127.0.0.1:5000/"
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged")
    }
});

dropZone.addEventListener("dragleave", (e) => {
    // if(dropZone.classList.contains("dragged")) {
        dropZone.classList.remove("dragged")
    // }
})

dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    e.preventDefault();
    dropZone.classList.remove("dragged");
    if(files.length) {
        fileInput.files = files;
        uploadFile();
    }
})

fileInput.addEventListener("change", () => {
    uploadFile()
})

browseBtn.addEventListener("click", () => {
    fileInput.click();
})

copyBtn.addEventListener("click", () => {
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied!");
})

const resetFileInput = () => {
    fileInput.value = "";
}

const uploadFile = () => {
    progressContainer.style.display = "block";

    if(fileInput.files.length > 1) {
        resetFileInput();
        showToast("Only Upload One File!");
        return;
    }
    
    const file = fileInput.files[0];

    if(file.size > maxAllowedSize) {
        resetFileInput()
        showToast("Can't upload more than 100MB");
    }

    const formData = new FormData();

    formData.append("myFile", file);

    fetch(uploadURL, {
        method: "POST",
        body: formData
        // headers: {
        //     "Content-Type": "application/json"
        // }
    }).then(res => res.json()).then(data => {
        // console.log("data : ", data);
        onUploadSuccess(data);
    }).catch(err => {
        console.log(("error => ", err));
        resetFileInput();
        showToast(`Error in Upload: ${err}`)
    })
    
    // const xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = () => {
    //     if(xhr.readyState === XMLHttpRequest.DONE) {
    //         console.log(xhr.response);
    //         onUploadSuccess(JSON.parse(xhr.response));
    //     }
    // };

    // xhr.upload.onprogress = () => updateProgress;

    // xhr.upload.onerror = () => {
    //     resetFileInput();
    //     // console.log("error in upload :", xhr.statusText);
    //     showToast(`Error in Upload: ${xhr.statusText}`)
    // }
    // xhr.open("POST", uploadURL);
    // xhr.send(formData);
}


const updateProgress = (e)=> {
    const percent = Math.round((e.loaded / e.total)) * 100;
    console.log(percent)
    bgProgress.getElementsByClassName.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
}

// const onUploadSuccess = ({ file, url }) => {
//     console.log(file, url);
//     resetFileInput();
//     emailForm[2].removeAttribute("disabled");
//     progressContainer.style.display = "none"
//     sharingContainer.style.display = "block"
//     fileURLInput.value = url;

// };
const onUploadSuccess = ({ file }) => {
    // console.log(file, url);
    resetFileInput();
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none"
    sharingConatiner.style.display = "block"
    emailContainer.style.display = "block";
    fileURLInput.value = file;

};

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = fileURLInput.value;
    const formData = JSON.stringify({
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    });
    
    console.table(formData);

    emailForm[2].setAttribute("disabled", "true");

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: formData
    }).then(res => res.json()).then(({ success }) => {
        if(success) {
            sharingConatiner.style.display = "none";
            showToast("Email Sent")
        }
    }).catch(err => {
        console.log("email error: ", err);
    })

});

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = `translate(-50%, 0)`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = `translate(-50%, 60px)`;
    }, 2000);
}