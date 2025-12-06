#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

POSTGRESQL_DIR="${SCRIPT_DIR}/infrastructure/postgresql"
RABBITMQ_DIR="${SCRIPT_DIR}/infrastructure/rabbitmq"
REDIS_DIR="${SCRIPT_DIR}/infrastructure/redis"

NETWORK_NAME="metrical_network"

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

create_network() {
    print_header "Creating Docker Network"
    
    if docker network ls | grep -q "${NETWORK_NAME}"; then
        print_info "Network '${NETWORK_NAME}' already exists"
    else
        print_info "Creating network '${NETWORK_NAME}'..."
        docker network create --subnet=152.18.0.0/24 "${NETWORK_NAME}"
        print_success "Network '${NETWORK_NAME}' created"
    fi
}

start_postgresql() {
    print_header "Starting PostgreSQL"
    print_info "Starting PostgreSQL container..."
    cd "${POSTGRESQL_DIR}"
    docker-compose up -d
    print_success "PostgreSQL started on port 5325"
}

start_redis() {
    print_header "Starting Redis"
    print_info "Starting Redis container..."
    cd "${REDIS_DIR}"
    docker-compose up -d
    print_success "Redis started on port 6379"
}

start_rabbitmq() {
    print_header "Starting RabbitMQ"
    print_info "Starting RabbitMQ container..."
    cd "${RABBITMQ_DIR}"
    docker-compose up -d
    print_success "RabbitMQ started on ports 5672 (AMQP) and 15672 (Management)"
}

stop_all() {
    print_header "Stopping All Services"
    
    print_info "Stopping PostgreSQL..."
    cd "${POSTGRESQL_DIR}" && docker-compose down
    
    print_info "Stopping Redis..."
    cd "${REDIS_DIR}" && docker-compose down
    
    print_info "Stopping RabbitMQ..."
    cd "${RABBITMQ_DIR}" && docker-compose down
    
    print_success "All services stopped"
}

restart_all() {
    print_header "Restarting All Services"
    stop_all
    sleep 2
    start_all
}

start_all() {
    create_network
    start_postgresql
    start_redis
    start_rabbitmq
    
    print_header "All Services Started"
    echo ""
    echo -e "${GREEN}Services are running:${NC}"
    echo -e "  • PostgreSQL: ${BLUE}localhost:5325${NC}"
    echo -e "    - Database: metrical"
    echo -e "    - User: sa"
    echo -e "    - Password: Admin@123"
    echo ""
    echo -e "  • Redis: ${BLUE}localhost:6379${NC}"
    echo ""
    echo -e "  • RabbitMQ: ${BLUE}localhost:5672${NC} (AMQP)"
    echo -e "    - Management UI: ${BLUE}http://localhost:15672${NC}"
    echo -e "    - User: metrical"
    echo -e "    - Password: metrical2025"
    echo ""
}

status() {
    print_header "Service Status"
    docker ps -a --filter "name=postgresql" --filter "name=redis" --filter "name=rabbit" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

logs() {
    print_header "Service Logs"
    docker logs "$1" --tail=100 -f
}

usage() {
    echo "Usage: $0 {start|stop|restart|status|logs <service>}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all infrastructure services"
    echo "  stop     - Stop all infrastructure services"
    echo "  restart  - Restart all infrastructure services"
    echo "  status   - Show status of all services"
    echo "  logs     - Show logs for a specific service (postgresql|redis|rabbit)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 logs postgresql"
    exit 1
}

case "${1:-start}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        status
        ;;
    logs)
        if [ -z "$2" ]; then
            print_error "Please specify a service: postgresql, redis, or rabbit"
            exit 1
        fi
        logs "$2"
        ;;
    *)
        usage
        ;;
esac

