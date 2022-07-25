# POST http://localhost:3000/api/v1/users/register

{
"name":"Admin3",
"email":"admin3@gmail.com",
"password":"admin3",
"phone": "670922255",
"isAdmin":true,
"street":"street user",
"apartment":"9b",
"zip":"46702",
"city":"Gandia",
"country":"Spain"
}

## returns -->"passwordHash": "$2a$10$Q6tClpH3eklJLxvv3Qyree2Ow50fA.pmou8j3A2L9to9G9tYXGMm.",

# POST http://localhost:3000/api/v1/users/login

{
"email":"admin3@gmail.com",
"password":"admin3"
}

## returns --> "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmQ0MThhZDhiMzFhMzg1OTgwM2Y2MjIiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE2NTgwNjcyMDgsImV4cCI6MTY1ODE1MzYwOH0.Z4U_0wU1e29VCtpkpx1W3c7koUJGL9QW3ZM0jmdMES4"

## We will work with Bearen token

## POST http://localhost:3000/api/v1/product

{
"name":"",
"description":"",
"richDescription":"",
"image":"",
"images":"",
"brand":"",
"price":0,
"category":"a valid categoy id is needed",
"countInStock":0,
"rating":3,
"numReviews":4,
"isFeatured":true
}
