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


app.get('/info', (req, res, next) => {
    const time = new Date()
    let total = 0
    Person.find().then((docs) => {
        total = docs.length
        const page = `<p>Phonebook has info for ${total}</p>${time}`
        res.send(page);
    })
    .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person){
              res.json(person) 
            }
            else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        }) 
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
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


    person.save().then(savedPerson => {
        res.json(savedPerson)
        persons = persons.concat(person)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name : body.name,
        number : body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true})
        .then(updatedPerson =>  {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({error: 'malformattedd id'})
    }

    if (error.name === 'ValidationError'){
        return res.status(400).json({error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)}
)
