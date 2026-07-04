# AgriMind Use Case Diagram

This diagram documents the system's use cases for developers and contributors. It is **not** shown in the app UI.

## Use Case Diagram

```mermaid
usecaseDiagram
    actor Farmer
    actor SystemAdmin
    
    package "AgriMind System" {
        usecase "Get Crop Suggestion" as UC1
        usecase "Get Weather Advisory" as UC2
        usecase "Get Fertilizer Plan" as UC3
        usecase "Scan for Pest" as UC4
        usecase "Get Irrigation Schedule" as UC5
        usecase "Receive SMS Alert" as UC6
        usecase "View History" as UC7
    }
    
    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    Farmer --> UC7
    Farmer <--> UC6
    
    SystemAdmin --> UC7
```

## Use Case Descriptions

| Use Case | Actor | Description |
|----------|-------|-------------|
| Get Crop Suggestion | Farmer | Submit farm details to receive crop recommendations based on soil and location |
| Get Weather Advisory | Farmer | Receive weather-based farming advice for their location |
| Get Fertilizer Plan | Farmer | Get NPK and organic fertilizer recommendations for their crop and soil |
| Scan for Pest | Farmer | Upload a leaf photo for AI-powered disease/pest diagnosis |
| Get Irrigation Schedule | Farmer | Receive a weekly watering schedule tailored to crop and weather |
| Receive SMS Alert | Farmer | Get proactive SMS alerts for weather or farming events |
| View History | Farmer, System Admin | Review past advisory queries and scan results |
