// const reqr=require("./boy")
// const {xys,ages}=require("./boy")


// console.log(xys,ages);
// console.log(reqr.xys,reqr.ages);

const fs= require("fs")

//readfile
// fs.readFile("./doc/block.txt",(err,data)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log(data.toString());
//     }
// })

//writing
if(!fs.existsSync("./name")){
    fs.mkdir("./name",(err)=>{
        if(err){
            console.log(err);
        }
        console.log("file created");
    })
}else{
    fs.rmdir("./name",(err)=>{
        if(err){
            console.log(err);
        }
        console.log("file deleted");
    })
 }

 