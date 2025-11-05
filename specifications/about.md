# About the product specifications

## What is Base-Application

Base-Application is a foundational framework designed to streamline the development of applications in small teams. It provides a base set of the system objects to facilitate rapid application development, ensuring consistency and best practices across projects.

## Development Method

The main accent with development is set on using AI agents for development all project artefacts, including specifications, test and code. Development is devided on the following main parts:
- **Functional Requirement Writing**: Creating user stories and functional requirements that define the expected behavior of the system objects. It is a basis for the test case development.
- **Test Case Development**: Writing comprehensive test cases to validate the functionality and performance of each system object.
- **Code Generation**: Generate code based on the provided specifications and test cases until all tests are passed.
- **Documentation**: Generating detailed documentation for each system object, including usage instructions and technical details.

Development is devided into iterations, where each iteration focuses on a specific set of system objects. Initial iterations will prioritize core modules such as User Management, RBAC, Configuration Management, and Error Handling. 

## Functionality included into Base-Application

- User Management: based on using Keycloak as an identity and access management solution.
- Role-Based Access Control (RBAC): defining roles and permissions to control access to various parts of the application.
- Audit and Compliance: maintaining a comprehensive record of user activities, changes, and actions for security, compliance, and troubleshooting.
- Configuration Management: allowing administrators to configure application settings and preferences.
- Localization Support: enabling the application to support multiple languages and regional settings.
- Data Import/Export: providing functionality to import and export data in various formats.
- Notification System: sending alerts and notifications to users based on specific events or actions.
- Analytics and Reporting: generating reports, analytics, and visual dashboards based on the data within the application.
- API Integration: providing a set of APIs for integrating with other systems and services.
- Error Handling and Logging: implementing robust error handling mechanisms and logging for troubleshooting and monitoring.
- Business Process Management: tools for defining and managing business processes within the application.
- Workflow Automation: automating repetitive tasks and processes to improve efficiency.
- Search Functionality: implementing advanced search capabilities to quickly find data within the application.
- File Management: allowing users to upload, download, and manage files within the application.
- Human Resources Management: managing employees, departments, locations, and positions.

## Some Notes on the architecture

- So as Base-Application is targeted to be used in small teams, there will be no microservices with complex orchestration and big performance overhead. Well, maybe a little where it is really needed.
- Base-Application should be developed mainly by AI, so the system should be devided on modules small enough to be handled by AI with their context limitations.
- The system will be devided on several modules, each module will be responsible for a specific functionality. Each module will have its own database schema to ensure data isolation and integrity. But there will be a method to get cross module database data via DB views or inter-schmema queries.
- Inter-module dependencies will be documented, with cross-schema queries handled via database views to maintain data integrity.
- The system should be easily deployable via containerization (e.g., Docker) and orchestration tools (e.g., Kubernetes) to ensure scalability and ease of management.


