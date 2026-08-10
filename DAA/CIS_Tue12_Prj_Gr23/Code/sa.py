import math
import random
import matplotlib.pyplot as plt
import time

# Đọc dữ liệu từ file
with open("In/c203.txt", "r") as file:
    lines = file.read().strip().split('\n')

# Parse dữ liệu
vehicles = int(lines[4].split()[0])
vehicle_capacity = int(lines[4].split()[1])

customers = []
for line in lines[9:]:
    if line.strip() and line.split()[0].isdigit():
        parts = line.split()
        cust = (
            int(parts[0]),  # CUST NO
            float(parts[1]),  # XCOORD
            float(parts[2]),  # YCOORD
            int(parts[3]),  # DEMAND
            int(parts[4]),  # READY TIME
            int(parts[5]),  # DUE DATE
            int(parts[6])   # SERVICE TIME
        )
        customers.append(cust)

depot = customers[0]

# Calculate Euclidean distance
def distance(c1, c2):
    return math.sqrt((c1[1] - c2[1])**2 + (c1[2] - c2[2])**2)

# Initial solution using a greedy approach
def initial_solution(customers_subset):
    unvisited = customers_subset[1:]  # Exclude depot
    routes = []
    current_route = [depot]
    current_load = 0
    current_time = 0

    while unvisited:
        best_customer = None
        best_dist = float('inf')
        for customer in unvisited:
            arrival_time = current_time + distance(current_route[-1], customer)
            start_time = max(arrival_time, customer[4])
            if (current_load + customer[3] <= vehicle_capacity and
                start_time + customer[6] <= customer[5]):
                dist = distance(current_route[-1], customer)
                if dist < best_dist:
                    best_dist = dist
                    best_customer = customer
        if best_customer:
            arrival_time = current_time + distance(current_route[-1], best_customer)
            start_time = max(arrival_time, best_customer[4])
            current_route.append(best_customer)
            current_load += best_customer[3]
            current_time = start_time + best_customer[6]
            unvisited.remove(best_customer)
        else:
            current_route.append(depot)
            routes.append(current_route)
            current_route = [depot]
            current_load = 0
            current_time = 0
    if current_route != [depot]:
        current_route.append(depot)
        routes.append(current_route)
    return routes

# Cost function (total distance)
def calculate_cost(routes):
    total_cost = 0
    for route in routes:
        for i in range(len(route) - 1):
            total_cost += distance(route[i], route[i + 1])
    return total_cost
    
# Generate neighbor solution (swap two customers between routes)
def generate_neighbor(routes):
    new_routes = [r[:] for r in routes]
    if len(new_routes) < 2:
        return new_routes
    r1_idx = random.randint(0, len(new_routes) - 1)
    r2_idx = random.randint(0, len(new_routes) - 1)
    while r2_idx == r1_idx:
        r2_idx = random.randint(0, len(new_routes) - 1)
    r1 = new_routes[r1_idx]
    r2 = new_routes[r2_idx]
    if len(r1) <= 2 or len(r2) <= 2:
        return new_routes
    i = random.randint(1, len(r1) - 2)
    j = random.randint(1, len(r2) - 2)
    r1[i], r2[j] = r2[j], r1[i]
    return new_routes if is_feasible(new_routes) else routes

# Feasibility check
def is_feasible(routes):
    for route in routes:
        load = sum(c[3] for c in route[1:-1])
        if load > vehicle_capacity:
            return False
        time = 0
        for i in range(len(route) - 1):
            dist = distance(route[i], route[i + 1])
            time += dist
            if i + 1 < len(route) - 1:
                arrival_time = time
                start_time = max(arrival_time, route[i + 1][4])
                if start_time > route[i + 1][5]:
                    return False
                time = start_time + route[i + 1][6]
    return True

# Simulated Annealing with cost history tracking
def simulated_annealing(customers_subset):
    current_solution = initial_solution(customers_subset)
    best_solution = current_solution[:]
    current_cost = calculate_cost(current_solution)
    best_cost = current_cost
    T = 1000
    T_min = 0.01
    alpha = 0.95
    iteration = 0
    max_iterations = 10000
    best_cost_history = [best_cost]  # Lưu lịch sử chi phí tốt nhất

    while T > T_min and iteration < max_iterations:
        new_solution = generate_neighbor(current_solution)
        new_cost = calculate_cost(new_solution)
        delta_e = new_cost - current_cost
        if delta_e < 0 or math.exp(-delta_e / T) > random.random():
            current_solution = new_solution
            current_cost = new_cost
            if new_cost < best_cost:
                best_cost = new_cost
                best_solution = new_solution[:]
        best_cost_history.append(best_cost)  # Lưu chi phí tốt nhất vào lịch sử
        T *= alpha
        iteration += 1

    return best_solution, best_cost, best_cost_history

# Visualize routes
def plot_routes(routes, total_distance, num_customers):
    plt.figure(figsize=(10, 8))
    colors = ['red', 'green', 'blue', 'purple', 'orange', 'cyan', 'magenta', 'yellow']

    # Plot destinations
    x_coords = [cust[1] for cust in routes[0] if len(routes[0]) > 0] + [cust[1] for route in routes for cust in route[1:-1]]
    y_coords = [cust[2] for cust in routes[0] if len(routes[0]) > 0] + [cust[2] for route in routes for cust in route[1:-1]]
    plt.scatter(x_coords, y_coords, c='blue', label='destinations')

    # Plot depot
    depot_x, depot_y = depot[1], depot[2]
    plt.scatter(depot_x, depot_y, c='red', s=100, label='depot', marker='*')

    # Plot routes
    for i, route in enumerate(routes):
        color = colors[i % len(colors)]
        x = [cust[1] for cust in route]
        y = [cust[2] for cust in route]
        plt.plot(x, y, c=color, label=f'path {i+1}, length={calculate_cost([route]):.2f}' if len(route) > 2 else '')
        for j in range(len(route) - 1):
            dist = distance(route[j], route[j + 1])
            plt.annotate(f'{dist:.2f}', ((route[j][1] + route[j+1][1])/2, (route[j][2] + route[j+1][2])/2),
                        fontsize=8, ha='center')

    plt.title(f'Simulated Annealing (Customers: {num_customers}) - Total Distance = {total_distance:.2f}')
    plt.xlabel('X coordinate')
    plt.ylabel('Y coordinate')
    plt.legend()
    plt.grid(True)
    plt.savefig(f'sa_plot_{num_customers}_customers.png')
    plt.close()

# Plot convergence
def plot_convergence(best_cost_history, num_customers):
    plt.figure(figsize=(10, 6))
    plt.plot(range(len(best_cost_history)), best_cost_history, 'b-', label='Best Cost')
    plt.title(f'Convergence Plot for Simulated Annealing (Customers: {num_customers})')
    plt.xlabel('Iteration')
    plt.ylabel('Best Cost (Total Distance)')
    plt.grid(True)
    plt.legend()
    plt.savefig(f'sa_convergence_{num_customers}_customers.png')
    plt.close()

# Print detailed output
def print_detailed_output(routes, total_distance, num_customers, exec_time):
    print(f"\n=== Simulated Annealing Output (Customers: {num_customers}) ===")
    print(f"Execution Time: {exec_time:.2f} milliseconds")
    print(f"Number of vehicles: {len(routes)}")
    print("\nPaths:")
    for i, route in enumerate(routes):
        route_ids = [cust[0] for cust in route]
        path_length = calculate_cost([route])
        print(f"path {i+1}: {route_ids}, length = {path_length:.2f}")
    print(f"\nTotal Distance: {total_distance:.2f}")

# Run and test for different customer sizes
if __name__ == "__main__":
    customer_sizes = [25, 50, 75, 100]
    for size in customer_sizes:
        # Subset customers (depot + size customers)
        customers_subset = customers[:size + 1]  # +1 to include depot
        print(f"\nTesting with {size} customers...")

        # Measure execution time in milliseconds
        start_time = time.time()
        routes, total_distance, best_cost_history = simulated_annealing(customers_subset)
        exec_time = (time.time() - start_time) * 1000  # Convert to milliseconds

        # Output results
        print_detailed_output(routes, total_distance, size, exec_time)
        plot_routes(routes, total_distance, size)
        plot_convergence(best_cost_history, size)  # Vẽ biểu đồ hội tụ