
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const items = [];
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shubhamsaurav810:A3E3B483@cluster0.afu5rhw.mongodb.net/todolistDB")

const itemsSchema={
  name:String
};

const Item = mongoose.model("item",itemsSchema);

const item1 = new Item({
  name:"welcome to todolist"
});

const item2 = new Item({
  name:"hit + to add a new item!"
});

const item3 = new Item({
  name:"<--hit this to delete item"
});

const defaultItems = [item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

  

app.get("/", function(req, res) {

  Item.find({})
  .then((foundItems) => {

    if (foundItems.length===0){
      Item.insertMany(defaultItems).then((err)=>{
        console.log(err);
      })
      res.redirect("/");

  }

  else{
    console.log("Successfully saved data in database!")
  }
  res.render("list", { listTitle: "Today", newListItems: foundItems });

// res.redirect("/");
})

//  .catch((err)=>{
//   res.render("list", { listTitle: "Today", newListItems: foundItems });
// console.log(err);

// })
});
  

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const items = new Item({
    name:itemName
  });

  if(listName==="Today"){
    items.save();
  res.redirect("/");
  }else{
    List.findOne({name:listName})
    .then((foundList)=>{
      foundList.items.push(items);
      foundList.save();
      res.redirect("/"+listName)
  })
  
  
  }
})
;




app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);



  List.findOne({name:customListName}).then((foundList)=>{
    
      if(!foundList){
       //Create a new list
        const list = new List({
    name:customListName,
    items:defaultItems
  });
  list.save();
  res.redirect("/"+customListName);
      }
      else{
        //Show an existing list
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});

      }
    }
  )
  .catch((err)=>{
    console.log(err);
  })
  
  // list.save();

})


app.post("/delete",function(req,res){
  const checkedItemId =  req.body.checkbox;
  const listName= req.body.listName;

  if(listName=== "Today"){
    Item.findByIdAndRemove(checkedItemId).then((err)=>{
      console.log(err);
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then((err)=>{
      if(!err){
        res.redirect("/"+listName);
      }else{
        res.redirect("/"+listName);
      }
      
    });
  }

})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
