(function(){
    let btnAddFolder = document.querySelector("#addFolder");
    let btnAddTextfile = document.querySelector("#addTextFile");
    let btnAddAlbum = document.querySelector("#addAlbum");
    let divBreadCrumb= document.querySelector("#BreadCrumb");
    let aRootPath = divBreadCrumb.querySelector("a[purpose = 'path']");
    let divContainer = document.querySelector("#Container");

    let divApp = document.querySelector("#App");
    let divAppTitleBar = document.querySelector("#app-title-bar");
    let divAppTitle = document.querySelector("#app-title");
    let divAppMenuBar = document.querySelector("#app-menue-bar");
    let divAppBody = document.querySelector("#app-body");
    let appClose = document.querySelector("#app-close"); 

    let templates = document.querySelector("#templates");
    let resources = []; 
    let cfid = -1;    // initially at root which has an id of '-1'. 
    let rid = 0; 

    btnAddFolder.addEventListener("click", addFolder);
    btnAddTextfile.addEventListener("click", addTextFile);
    aRootPath.addEventListener("click", viewFolderFromPath);
    appClose.addEventListener("click", closeApp);

    function closeApp(){
        divAppTitle.innerHTML = "Title Will Come Here";
        divAppMenuBar.innerHTML = "";
        divAppTitle.setAttribute("rid", "")
        divAppBody.innerHTML = ""; 

    }

    function addFolder(){
        let rname = prompt("Enter Folder's Name");
        if(rname != null){
            rname = rname.trim();
        }

        if(!rname){
            alert("Can't be empty. Enter a valid name.");
            return;
        }

        let alreadyExist = resources.some(f => f.rname == rname && f.pid == cfid);
        if(alreadyExist == true){
            alert("Same name exists. Enter a different name.");
            return;
        }

        rid++
        let pid = cfid; 
        addFolderHTML(rname, rid, pid);

        resources.push({
            rid: rid,
            rname: rname, 
            rtype: "folder", 
            pid: cfid
        });

        saveToStorage(); 
    }
    
    function addTextFile(){
        let rname = prompt("Enter Text File's Name");
        if(rname != null){
            rname = rname.trim();
        }

        if(!rname){
            alert("Can't be empty. Enter a valid name.");
            return;
        }

        let alreadyExist = resources.some(f => f.rname == rname && f.pid == cfid);
        if(alreadyExist == true){
            alert("Same name exists. Enter a different name.");
            return;
        }

        rid++
        let pid = cfid; 
        addTextFileHTML(rname, rid, pid);

        resources.push({
            rid: rid,
            rname: rname, 
            rtype: "text-file", 
            pid: cfid,
            isBold: false,
            isItalic: false, 
            isUnderline: false, 
            bgColor: "#ffffff", 
            textColor: "#000000", 
            fontSize: "14",
            fontFamily: "monospace",
            content: "I am a new file. You can EDIT..."
        });

        saveToStorage(); 
    }

    function deleteFolder(){
        let spanDelete = this; 
        let divFolder = spanDelete.parentNode; 
        let divName = divFolder.querySelector("[purpose = 'name']");
        let fid = parseInt(divFolder.getAttribute("rid")); 
        let fname = divName.innerHTML;
        
        let childrenExists = resources.some(r => r.pid == fid);
        let sure  = confirm(`Are you sure you want to delete ${fname}?` + (childrenExists? " It also has children." : ""));
        if(!sure){
            return; 
        }

        // Remove Fom HTML
        divContainer.removeChild(divFolder); 

        // RAM
        deleteHelper(fid); 
        
        // Storage 
        saveToStorage(); 
    }

    function deleteHelper(fid){
        let children = resources.filter(r => r.pid == fid);
        for(let i = 0; i < children.length; i++){
            deleteHelper(children[i].rid); 
        }
        
        let ridx = resources.findIndex(r => r.rid == fid); 
        resources.splice(ridx, 1);
    }

    function deleteTextFile(){
        let spanDelete = this; 
        let divTextFile = spanDelete.parentNode; 
        let divName = divTextFile.querySelector("[purpose = 'name']");
        let fid = parseInt(divTextFile.getAttribute("rid")); 
        let fname = divName.innerHTML;
        
        let sure  = confirm(`Are you sure you want to delete ${fname}?`);
        if(!sure){
            return; 
        }

        // Remove Fom HTML
        divContainer.removeChild(divTextFile); 

        // RAM
        let fidx = resources.findIndex(r => r.rid == fid);
        resources.splice(fidx, 1);  
        
        // Storage 
        saveToStorage(); 
    }

    function renameFolder(){
        let nrname = prompt("Enter Folder's Name");
        if(nrname != null){
            nrname = nrname.trim();
        }

        if(!nrname){
            alert("Can't be empty. Enter a valid name.");
            return;
        }

        let spanRename = this; 
        let divFolder = spanRename.parentNode;
        let divName = divFolder.querySelector("[purpose = name]");
        let orname = divName.innerHTML; 
        let ridToBeUpdated = parseInt(divFolder.getAttribute("rid"));
        if(orname == nrname){
            alert("Enter a different name.");
            return;
        }

        let alreadyExist = resources.some(f => f.nrname == nrname && f.pid == cfid); 
        if(alreadyExist == true){
            alert("Same name exists. Enter a different name.");
            return;
        }

        // change in HTML
        divName.innerHTML = nrname; 

        // change in RAM
        let resource = resources.find(f => f.rid == ridToBeUpdated);
        resource.rname = nrname;

        // change in storage
        saveToStorage();
    }

    function renameTextFile(){
        let nrname = prompt("Enter Text File's Name");
        if(nrname != null){
            nrname = nrname.trim();
        }

        if(!nrname){
            alert("Can't be empty. Enter a valid name.");
            return;
        }

        let spanRename = this; 
        let divTextFile = spanRename.parentNode;
        let divName = divTextFile.querySelector("[purpose = name]");
        let orname = divName.innerHTML; 
        let ridToBeUpdated = parseInt(divTextFile.getAttribute("rid"));
        if(orname == nrname){
            alert("Enter a different name.");
            return;
        }

        let alreadyExist = resources.some(f => f.nrname == nrname && f.pid == cfid); 
        if(alreadyExist == true){
            alert("Same name exists. Enter a different name.");
            return;
        }

        // change in HTML
        divName.innerHTML = nrname; 

        // change in RAM
        let resource = resources.find(f => f.rid == ridToBeUpdated);
        resource.rname = nrname;

        // change in storage
        saveToStorage();
    }

    function viewFolder(){
        let spanView = this; 
        let divFolder = spanView.parentNode;
        let divName = divFolder.querySelector("[purpose = 'name']"); 
        
        let fname = divName.innerHTML; 
        let fid = parseInt(divFolder.getAttribute("rid"));

        let aPathTemplate = templates.content.querySelector("a[purpose = 'path']");
        let aPath = document.importNode(aPathTemplate, true); 

        aPath.innerHTML = fname; 
        aPath.setAttribute("rid", fid);
        aPath.addEventListener("click", viewFolderFromPath);
        divBreadCrumb.appendChild(aPath);

        cfid = fid; 
        divContainer.innerHTML = "";
        resources.forEach( f =>{
            if(f.pid == cfid && f.rtype == "folder"){
                addFolderHTML(f.rname, f.rid, f.pid);
            }
            else if(f.pid == cfid && f.rtype == "text-file"){
                addTextFileHTML(f.rname, f.rid, f.pid);
            }
            else if(f.pid == cfid && f.rtype == "album"){
                addAlbumHTML(f.rname, f.rid, f.pid);
            }
        });    
    }

    function viewFolderFromPath(){
        let aPath = this; 
        let fid = parseInt(aPath.getAttribute("rid")); 

        while(aPath.nextSibling){
            aPath.parentNode.removeChild(aPath.nextSibling);
        }

        cfid = fid; 
        divContainer.innerHTML = "";
        resources.forEach( f =>{
            if(f.pid == cfid && f.rtype == "folder"){
                addFolderHTML(f.rname, f.rid, f.pid);
            }
            else if(f.pid == cfid && f.rtype == "text-file"){
                addTextFileHTML(f.rname, f.rid, f.pid);
            }
            else if(f.pid == cfid && f.rtype == "album"){
                addAlbumHTML(f.rname, f.rid, f.pid);
            }
        }); 
    }
    
    function viewTextFile(){
        let spanView = this; 
        let divTextFile = spanView.parentNode; 
        let divName = divTextFile.querySelector("[purpose = name]");
        let fname = divName.innerHTML; 
        let fid = parseInt(divTextFile.getAttribute("rid")); 
        let divNotepadMenuTemplate = templates.content.querySelector("[purpose = notepad-menu]");
        let divNotepadMenu = document.importNode(divNotepadMenuTemplate, true); 
        
        divAppMenuBar.innerHTML = ""; 
        divAppMenuBar.appendChild(divNotepadMenu); 

        let divNotepadBodyTemplate = templates.content.querySelector("[purpose = notepad-body]");
        let divNotepadBody = document.importNode(divNotepadBodyTemplate, true);
        
        divAppBody.innerHTML = "";
        divAppBody.appendChild(divNotepadBody); 

        divAppTitle.innerHTML = fname; 
        divAppTitle.setAttribute("rid", fid);

        let spanSave = divAppMenuBar.querySelector("[action = save]");
        let spanBold = divAppMenuBar.querySelector("[action = bold]");
        let spanItalic = divAppMenuBar.querySelector("[action = italic]");
        let spanUnderline = divAppMenuBar.querySelector("[action = underline]");
        let inputBGcolor = divAppMenuBar.querySelector("[action = bgColor]");
        let inputTextcolor = divAppMenuBar.querySelector("[action = fgColor]");
        let selectFontFamily = divAppMenuBar.querySelector("[action = font-family]");
        let selectFontSize = divAppMenuBar.querySelector("[action = font-size]");
        let spanDownload = divAppMenuBar.querySelector("[action = download");
        let spanForUpload = divAppMenuBar.querySelector("[action = forupload");
        let inputUpload = divAppMenuBar.querySelector("[action = upload]");
        let textArea = divAppBody.querySelector("textArea");

        spanSave.addEventListener("click", saveNotepad);
        spanBold.addEventListener("click", makeNotepadBold);
        spanItalic.addEventListener("click", makeNotepadItalic);
        spanUnderline.addEventListener("click", makeNotepadUnderline);
        inputBGcolor.addEventListener("change", changeNotepadBGcolor);
        inputTextcolor.addEventListener("change", changeNotepadTextcolor);
        selectFontFamily.addEventListener("change", changeNotepadFontFamily);
        selectFontSize.addEventListener("change", changeNotepadFontSize);
        spanDownload.addEventListener("click", downloadNotepad);
        inputUpload.addEventListener("change", uplaodNotepad);
        spanForUpload.addEventListener("click", function(){
            inputUpload.click();
        })

        let resource = resources.find(r => r.rid == fid)
        spanBold.setAttribute("pressed", !resource.isBold);
        spanItalic.setAttribute("pressed",!resource.isItalic);
        spanUnderline.setAttribute("pressed", !resource.isUnderline);
        inputBGcolor.value = resource.bgColor;
        inputTextcolor.value = resource.textColor;
        selectFontFamily.value = resource.fontFamily;
        selectFontSize.value = resource.fontSize;
        textArea.value = resource.content; 

        spanBold.dispatchEvent(new Event("click"));
        spanItalic.dispatchEvent(new Event("click"));
        spanUnderline.dispatchEvent(new Event("click"));
        inputBGcolor.dispatchEvent(new Event("change"));
        inputTextcolor.dispatchEvent(new Event("change"));
        selectFontFamily.dispatchEvent(new Event("change"));
        selectFontSize.dispatchEvent(new Event("change"));
    }

    function downloadNotepad(){
        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.rid == fid);
        let divNotepadMenu = this.parentNode; 

        let strForDownload = JSON.stringify(resource); 
        let encodedData = encodeURIComponent(strForDownload);  // encodeURIComponent makes the file downloadable.

        let aDownload = divNotepadMenu.querySelector("a[purpose = download]");
        aDownload.setAttribute("href", "data:text/json; charset=utf-8, " + encodedData);
        aDownload.setAttribute("download", resource.rname + ".json");

        aDownload.click(); 
    }

    function uplaodNotepad(){
        let file = window.event.target.files[0];
        let reader = new FileReader(); 
        
        reader.addEventListener("load", function(){
            let data = window.event.target.result; 
            let resource = JSON.parse(data);

            let spanBold = divAppMenuBar.querySelector("[action = bold]");
            let spanItalic = divAppMenuBar.querySelector("[action = italic]");
            let spanUnderline = divAppMenuBar.querySelector("[action = underline]");
            let inputBGcolor = divAppMenuBar.querySelector("[action = bgColor]");
            let inputTextcolor = divAppMenuBar.querySelector("[action = fgColor]");
            let selectFontFamily = divAppMenuBar.querySelector("[action = font-family]");
            let selectFontSize = divAppMenuBar.querySelector("[action = font-size]");
            let textArea = divAppBody.querySelector("textArea");

            spanBold.setAttribute("pressed", !resource.isBold);
            spanItalic.setAttribute("pressed",!resource.isItalic);
            spanUnderline.setAttribute("pressed", !resource.isUnderline);
            inputBGcolor.value = resource.bgColor;
            inputTextcolor.value = resource.textColor;
            selectFontFamily.value = resource.fontFamily;
            selectFontSize.value = resource.fontSize;
            textArea.value = resource.content; 

            spanBold.dispatchEvent(new Event("click"));
            spanItalic.dispatchEvent(new Event("click"));
            spanUnderline.dispatchEvent(new Event("click"));
            inputBGcolor.dispatchEvent(new Event("change"));
            inputTextcolor.dispatchEvent(new Event("change"));
            selectFontFamily.dispatchEvent(new Event("change"));
            selectFontSize.dispatchEvent(new Event("change"));
        })
        reader.readAsText(file);


    }

    function saveNotepad(){
        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.rid == fid);

        let spanBold = divAppMenuBar.querySelector("[action = bold]");
        let spanItalic = divAppMenuBar.querySelector("[action = italic]");
        let spanUnderline = divAppMenuBar.querySelector("[action = underline]");
        let inputBGcolor = divAppMenuBar.querySelector("[action = bgColor]");
        let inputTextcolor = divAppMenuBar.querySelector("[action = fgColor]");
        let selectFontFamily = divAppMenuBar.querySelector("[action = font-family]");
        let selectFontSize = divAppMenuBar.querySelector("[action = font-size]");
        let textArea = divAppBody.querySelector("textArea");


        resource.isBold = spanBold.getAttribute("pressed") == "true";;
        resource.isItalic = spanItalic.getAttribute("pressed") == "true";;
        resource.isUnderline = spanUnderline.getAttribute("pressed") == "true";;
        resource.bgColor = inputBGcolor.value; 
        resource.textColor = inputTextcolor.value; 
        resource.fontFamily = selectFontFamily.value;
        resource.fontSize = selectFontSize.value;
        resource.content = textArea.value;

        saveToStorage();
    }

    function makeNotepadBold(){
        let textArea = divAppBody.querySelector("textArea"); 
        let isPressed = this.getAttribute("pressed") == "true";
        if(isPressed == false){
            this.setAttribute("pressed", true); 
            textArea.style.fontWeight = "bold"; 
        }
        else{
            this.setAttribute("pressed", false);
            textArea.style.fontWeight = "normal";
        }
    }

    function makeNotepadItalic(){
        let textArea = divAppBody.querySelector("textArea"); 
        let isPressed = this.getAttribute("pressed") == "true";
        if(isPressed == false){
            this.setAttribute("pressed", true); 
            textArea.style.fontStyle = "italic"; 
        }
        else{
            this.setAttribute("pressed", false);
            textArea.style.fontStyle = "normal";
        }
    }

    function makeNotepadUnderline(){
        let textArea = divAppBody.querySelector("textArea"); 
        let isPressed = this.getAttribute("pressed") == "true";
        if(isPressed == false){
            this.setAttribute("pressed", true); 
            textArea.style.textDecoration = "underline"; 
        }
        else{
            this.setAttribute("pressed", false);
            textArea.style.textDecoration = "none";
        }
    }

    function changeNotepadBGcolor(){
        let color = this.value; 
        let textArea = divAppBody.querySelector("textArea"); 
        textArea.style.backgroundColor = color;
    }

    function changeNotepadTextcolor(){
        let color = this.value; 
        let textArea = divAppBody.querySelector("textarea"); 
        textArea.style.color = color;
    }

    function changeNotepadFontFamily(){
        let fontFamily = this.value; 
        let textArea = divAppBody.querySelector("textarea");
        textArea.style.fontFamily = fontFamily
    }

    function changeNotepadFontSize(){
        let fontSize = this.value; 
        let textArea = divAppBody.querySelector("textarea");
        textArea.style.fontSize = fontSize
    }

    function addFolderHTML(rname, rid, pid){
        let divFolderTemplate = templates.content.querySelector(".folder");
        let divFolder = document.importNode(divFolderTemplate, true);

        let spanRename = divFolder.querySelector("[action=rename]"); 
        let spanDelete = divFolder.querySelector("[action=delete]"); 
        let spanView = divFolder.querySelector("[action=view]"); 
        let divName = divFolder.querySelector("[purpose=name]"); 

        spanRename.addEventListener("click", renameFolder);
        spanDelete.addEventListener("click", deleteFolder);
        spanView.addEventListener("click", viewFolder);
        divName.innerHTML = rname;
        divFolder.setAttribute("rid", rid);
        divFolder.setAttribute("pid", pid);

        divContainer.appendChild(divFolder);
    }

    function addTextFileHTML(rname, rid, pid){
        let divTextFileTemplate = templates.content.querySelector(".text-file");
        let divTextFile = document.importNode(divTextFileTemplate, true);

        let spanRename = divTextFile.querySelector("[action=rename]"); 
        let spanDelete = divTextFile.querySelector("[action=delete]"); 
        let spanView = divTextFile.querySelector("[action=view]"); 
        let divName = divTextFile.querySelector("[purpose=name]"); 

        spanRename.addEventListener("click", renameTextFile);
        spanDelete.addEventListener("click", deleteTextFile);
        spanView.addEventListener("click", viewTextFile);
        divName.innerHTML = rname;
        divTextFile.setAttribute("rid", rid);
        divTextFile.setAttribute("pid", pid);

        divContainer.appendChild(divTextFile);
    }

    function saveToStorage(){
        let rJson = JSON.stringify(resources);    // used to conver jso to json which can be saved.
        localStorage.setItem("data", rJson);
    }

    function loadFromStorage(){
        let rJson = localStorage.getItem("data");
        if(!!rJson){
            resources = JSON.parse(rJson);
            resources.forEach( f =>{
                if(f.pid == cfid && f.rtype == "folder"){
                    addFolderHTML(f.rname, f.rid, f.pid);
                }
                else if(f.pid == cfid && f.rtype == "text-file"){
                    addTextFileHTML(f.rname, f.rid, f.pid);
                }
                
                if(f.rid > rid){
                    rid = f.rid;
                }
            });
        }
    }

    loadFromStorage();

})();    