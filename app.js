const express=require("express")
const request=require("request");
const bodyParser = require("body-parser");
const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");
const _=require("lodash")
mongoose.connect("mongodb://localhost:27017/ToDoListDB",{useNewUrlParser:true})


// const items=[];
// const worklist=[];
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine','ejs')

const itemschema=new mongoose.Schema({
    name:String
});
const Item=new mongoose.model("Item",itemschema);

const item1=new Item({
    name:"Welcome to your To DO list"
})
const item2=new Item({
    name:"Hit + to add new Item"
})

const item3=new Item({
    name:"<-- Hit this to delete an Item"
})

const defaultItem=[item1,item2,item3];



app.get("/",(req,res)=>{
    
  
    // day=date.getDay();
    Item.find({}).then((foundItems)=>{
        if(foundItems.length===0)
        {
            Item.insertMany(defaultItem).then(()=>{
                console.log("Successfully saved");
               
            }).catch((err)=>{
            console.log(err)
            })
        }
        
        
    })

    Item.find({}).then((foundItems)=>{
        res.render('list',{ListOfTitles:"Today",Allitem:foundItems});
    })
});




app.post("/",(req,res)=>{
    const itemName=req.body.newitem;
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    })
    if(listName==="Today")
    {
        item.save();
    res.redirect("/");
    }else{
        List.findOne({name:listName}).then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
  
});


app.get("/about",(req,res)=>{
    res.render("about");
})
// app.post("/work",(req,res)=>{
//     let item=req.body.newitem;
//     worklist.push(item);
//     res.render("/work")
// });

app.post("/delete",(req,res)=>{
const checkedId=req.body.checkbox;
const listTitle=req.body.listTitle;

if(listTitle==="Today"){
    Item.findByIdAndRemove(checkedId).then(()=>{
        console.log("Successfully Delted Item")
    }).catch((err)=>{
        console.log(err);
    })
    res.redirect("/");
    
}else{
    List.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:checkedId}}}).then((foundList)=>
    {
        if(foundList)
        console.log("Successfully Deleted")
        foundList.save();
        res.redirect("/"+listTitle)
    }).catch((err)=>{
        console.log(err)
    })
  
}

})


const ListSchema={
    name:String,
    items:[itemschema]
    
}
const List=new mongoose.model("List",ListSchema);

app.get("/:list",(req,res)=>{
    let customListName=req.params.list;
    customListName=_.capitalize(customListName)
    List.findOne({name:customListName}).then((foundItem)=>{
        if(!foundItem)
          { const list=new List({
            name:customListName,
            items:defaultItem
           
        })
        list.save();
        res.redirect("/" +customListName)
    }
        else
        {
        res.render("list",{ListOfTitles:foundItem.name,Allitem:foundItem.items})
     }

    }).catch((err)=>{
        if(err)
        console.log(err);
    
    })

   
})

app.listen(3000,()=>{
    console.log("Successfully running on 3000");
});