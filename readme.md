# E-Commerce Node.js Backend API

## Routes

## Postman: POST, body, raw y JSON

## Roberto. 31 video bien hecho, now 59 (4:56), 67

## AÑADIR A TODO LOS FICHEROS DE ROUTERS: try{}catch(){}

## RETURN CODES FROM THE SERVER

404 -> not found
400-> ERROR IN GENERAL
200 -> ok

### Products

```
GET      /api/v1/products
GET      /api/v1/products/:id
POST     /api/v1/products
PUT      /api/v1/products/:id
DELETE   /api/v1/products/:id
PUT gallery-images : /api/v1/products/gallery-images/:id
GET featured products: /api/v1/products/get/featured/:count
GET products count: /api/v1/products/get/count
```

### Orders

```
GET      /api/v1/orders
GET      /api/v1/orders/:id
POST     /api/v1/orders
PUT      /api/v1/orders/:id
DELETE   /api/v1/orders/:id
GET orders count: /api/v1/orders/get/count
```

### Users

```
GET      /api/v1/users
GET      /api/v1/users/:id
POST     /api/v1/users
PUT      /api/v1/users/:id
DELETE   /api/v1/users/:id
GET users count: /api/v1/users/get/count
```

#### Register new user

```
POST     /api/v1/users/register
```

#### Login user

To login the user and get the auth token you can use:

```
POST     /api/v1/users/login
```
