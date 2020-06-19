//jshint esversion:6


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const fetch = require("node-fetch");

// let ejs = require('ejs');
// const ejsLint = require('ejs-lint');

////! Mongoose
mongoose.connect("mongodb+srv://admin-kej:Test1234@cluster0-csasq.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = ({
    name: {
        type: String,

    }
});
const Item = mongoose.model('Item', itemsSchema);


const items1 = new Item(
    { name: "projects" }
);

const defualtItems = [items1];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);






const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get("/", (req, res) => {



    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {

            Item.insertMany(defualtItems, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Data inserted successfully");
                }
            });

            res.redirect("/");

        } else {

            res.render("list", { listTitle: "Today", newListItems: foundItems });

        }


    });

});


app.get("/:customListName", function (req, res) {

    const customListName = _.capitalize(req.params.customListName);


    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //create a New List 
                const list = new List({
                    name: customListName,
                    items: defualtItems
                });
                list.save();
                res.redirect("/" + customListName);

            } else {
                // Show an Existing List
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });


});



app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;


    const item = new Item(
        { name: itemName }
    );


    if (listName === "Today") {

        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (error, foundList) {


            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);




        });
    }




});


///! Deleting Items
app.post("/delete", function (req, res) {
    const checkedItemById = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.deleteOne({ _id: checkedItemById }, function (err) {
            if (!err) {
                console.log("Delete successfully");
            }
        });
        res.redirect("/");

    } else {

        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemById } } }, function (error, foundList) {

            if (!error) {
                res.redirect("/" + listName);
            }
        });
    }




});






app.get("/about", (req, res) => {

});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log("Server has started successfully");
});




