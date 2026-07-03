# System Flow

```mermaid
graph TD
    classDef client fill:#E8DCC8,stroke:#3A3A34,stroke-width:2px;
    classDef orchestrator fill:#C9846B,stroke:#fff,stroke-width:2px,color:#fff;
    classDef agent fill:#8FA88C,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#3A3A34,stroke:#fff,stroke-width:2px,color:#fff;

    UI[Farmer / Dashboard UI]:::client -->|Raw Inputs + Optional Image| Orch(Orchestrator Agent):::orchestrator
    
    Orch -->|Parallel Call| W(Weather Agent):::agent
    Orch -->|Parallel Call| C(Crop Agent):::agent
    Orch -->|Parallel Call| F(Fertilizer Agent):::agent
    Orch -->|Parallel Call| P(Pest Agent):::agent
    
    W --> I(Irrigation Agent):::agent
    
    C <-->|Query Crop Needs| VDB[(Chroma Vector DB)]:::db
    P <-->|Query Pathologies| VDB
    
    W --> Orch
    C --> Orch
    F --> Orch
    P --> Orch
    I --> Orch
    
    Orch -->|Final JSON| DB[(MongoDB)]:::db
    Orch -->|Return Summary| UI
    
    Cron((Cron Job)) -.->|Periodic Check| A(Alert Agent):::agent
    DB -.-> A
    A -.->|Twilio SMS| Phone[Farmer Phone]:::client
```

# Use Case Diagram

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
