# Taxi Platform Backend

Spring Boot backend for the taxi platform API.

## Default Admin

- login: `admin`
- password: `admin`

## WebSocket

- endpoint: `ws://localhost:8080/api/rides?token={jwt}`
- supported client messages: `ACCEPT_RIDE`, `REJECT_RIDE`, `UPDATE_LOCATION`, `CANCEL_RIDE`
- server events: `DRIVER_RIDE_REQUEST`, `RIDE_UPDATE`

## Run

```powershell
./mvnw spring-boot:run
```

## Test

```powershell
./mvnw test
```
