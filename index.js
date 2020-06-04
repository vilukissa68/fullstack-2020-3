require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/person')

let persons = []

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
morgan.token('body', function(req, res) { return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


const generateId = () => {
    return Math.floor(Math.random() * Math.floor(9999999))
}


app.get('/info', (req, res) => {
    const time = new Date()
    const page = `<p>Phonebook has info for ${persons.length}</p>${time}`
    res.send(page);
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if (person){
       res.json(person) 
    }
    else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if(!body.name){
        return res.status(400).json({
            error: 'name missing'
        })
    }

    if(!body.number){
        return res.status(400).json({
            error: 'number missing'
        }) 
    }

    const it = persons.find(p => p.name === body.name)
    if(it){
        return res.status(400).json({
            error: 'name alredy saved'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    })

    persons = persons.concat(person)

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)}
)
