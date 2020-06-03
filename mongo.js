const mongoose = require('mongoose')

if (process.argv.length > 5){
    console.log("Too many arguments!")
    process.exit(1)
}

if (process.argv.length == 4){
    console.log('Too few arguments give password, persons name and number as arguments')
    process.exit(1)
}


const password = process.argv[2]


const url = `mongodb+srv://fullstack:${password}@puhelinluettelo-s3pmj.mongodb.net/test?retryWrites=true&w=majority`

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3){
    console.log("phonebook:")
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close().then(process.exit(1))
    })

}
else{
    const newName = process.argv[3]
    const newNumber = process.argv[4]

    const person = new Person({
        name: newName,
        number: newNumber,
    })

    person.save().then(response => {
        console.log(`added ${newName} number ${newNumber} to phonebook`)
        process.exit(1)
    })
}