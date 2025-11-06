#!/bin/bash
# Test Environment Management Script

COMPOSE_FILE="docker-compose.test.yml"

case "$1" in
    start)
        echo "Starting test environment..."
        docker-compose -f $COMPOSE_FILE up -d
        echo "Test environment started!"
        echo "PostgreSQL: localhost:5433"
        echo "Keycloak Admin: http://localhost:8081"
        ;;
    stop)
        echo "Stopping test environment..."
        docker-compose -f $COMPOSE_FILE down
        echo "Test environment stopped!"
        ;;
    restart)
        echo "Restarting test environment..."
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $COMPOSE_FILE up -d
        echo "Test environment restarted!"
        ;;
    logs)
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    status)
        echo "Test environment status:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    clean)
        echo "Cleaning test environment (removes volumes)..."
        docker-compose -f $COMPOSE_FILE down -v
        echo "Test environment cleaned!"
        ;;
    *)
        echo "Test Environment Management Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start   - Start PostgreSQL and Keycloak test services"
        echo "  stop    - Stop test services"
        echo "  restart - Restart test services"
        echo "  logs    - Show logs from test services"
        echo "  status  - Show status of test services"
        echo "  clean   - Stop services and remove volumes (fresh start)"
        echo ""
        echo "Example: $0 start"
        ;;
esac