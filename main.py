# 1 Wczytanie pliku z miastami i utworzenie macierzy 
# kosztów na podstawie parametrów lat long
# id name demand, lat, long
# 0 Białystok 500 53.132488 23.168840
# 1 Bielsko-Biała 50 49.807621 19.055840
# 2 Chrzanów 400 50.144138 19.406010
# 3 Gdańsk 200 54.352024 18.646639
# 4 Gdynia 100 54.518890 18.530540
# 5 Gliwice 40 50.294221 18.669014
# 6 Gromnik 200 49.83902414993228 20.96119784297926
# 7 Katowice 300 50.33968286821007 19.01516996738232
# 8 Kielce 30 50.970310591640256 20.661311981896965
# 9 Krosno 60 49.68297353745183 21.766584084998335
# 10 Krynica 50 49.44420280014504 20.968629600348685
# 11 Lublin 60 51.34265063253116 22.558068853592754
# 12 Łódź 160 51.760556871078506 19.457328127297686
# 13 Malbork 100 54.05588245302834 19.0443377026258
# 14 Nowy-Targ 120 49.47699425780645 20.032694955713765
# 15 Olsztyn 300 53.77834465699683 20.48060203443028
# 16 Poznań 100 52.40603645765255 16.92642464607564
# 17 Puławy 200 51.4162970698275 21.96925364750922
# 18 Radom 100 51.40257756117106 21.146553400037853
# 19 Rzeszów 60 50.04210209587444 21.997572718272266
# 20 Sandomierz 200 50.68265598449184 21.748482365097647
# 21 Szczecin 150 53.433328592477274, 14.584111931275194
# 22 Szczucin 60 50.30938587165392 21.080642603301264
# 23 Szklarska-Poreba 50 50.82786954995206 15.52904787177399
# 24 Tarnów 70 50.012561650699325 20.982035381476546
# 25 Warszawa 200 52.22870582089366 21.01731054377364
# 26 Wieliczka 90 49.98703734755326 20.063516133976375
# 27 Wrocław 40 51.13450318131187 17.03310136227185
# 28 Zakopane 200 49.31802035016993 19.914217567621304
# 29 Zamość 300 50.74063815931091 23.31878826430273
# 30 Kraków 0 50.063860272041886 19.94840110431039

import numpy as np
import geopy.distance
import os
import random
# add loadenv
def read_config():
    return {
        "alfa" : 1,
        "beta" : 1,
        "evaporation" : 0.5,
        "iterations" : 1,
        "number_of_ants" : 1
    }

def read_input(filename):
    with open(filename, 'r+',encoding='utf-8') as file:
        lines = file.readlines()
        cities = [extract_params(line) for line in lines]
        return cities


def extract_params(text):
    [index, cityName, demand, lat, long] = text.split()
    return { "index" : int(index), "cityName": cityName, "demand": int(demand), "lat": float(lat[:6]), "long": float(long[:6]) }

def construct_distance_graph(cities):
    graph = []
    for city in cities:
        graph.append([])
        for city2 in cities:
            graph[city["index"]].append(calc_distance((city["lat"], city["long"]), (city2["lat"], city2["long"])) or np.inf)
    return graph

    
def calc_distance(coord_x:tuple, coord_y:tuple):
    return geopy.distance.geodesic(coord_x,coord_y).km

def main():
    cities = read_input("cities.txt")
    costMatrix = construct_distance_graph(cities)
    ant_colony(costMatrix, cities, read_config())

def ant_colony(costMatrix, cities, config):
    
    pheromoneMatrix = np.ones((len(costMatrix), len(costMatrix)))
    for iteration in range(config['iterations']):
        visitedCities = []
        antPath = []
        antCapacity = 1000
        for ant in range(config['number_of_ants']):
            selection = list(filter(lambda x: x not in visitedCities, cities))
            randomCity = random.choice(selection)
            antPath.append(randomCity)
            visitedCities.append(randomCity)
            antCapacity = antCapacity - randomCity["demand"]
            while (antCapacity > 0):
                currentAntLocation = antPath[-1]
                possibleRoutes = list(filter(lambda x: x not in visitedCities, cities))

                probabilites = []

                for route in possibleRoutes:
                    pheromoneIndicator = pheromoneMatrix[currentAntLocation["index"]][route["index"]] ** config["alfa"]
                    routeIndicator = (1 / costMatrix[currentAntLocation["index"]][route["index"]]) ** config["beta"]
                    denominator = 0
                    for route2 in possibleRoutes:
                        temp_pheromone = pheromoneMatrix[currentAntLocation["index"]][route2["index"]] ** config["alfa"]
                        temp_route_indicator = (1 / costMatrix[currentAntLocation["index"]][route2["index"]]) ** config["beta"]
                        denominator += temp_pheromone * temp_route_indicator
                
                    probabilites.append({ "cityName": route["cityName"], "demand": route["demand"],"index": route["index"], "cost": costMatrix[currentAntLocation["index"]][route["index"]], "pick_probability": (pheromoneIndicator * routeIndicator) / denominator })
            
                next_destination = spin_wheel(probabilites)
                antPath.append(next_destination)
                visitedCities.append(next_destination)
                antCapacity = antCapacity - next_destination["demand"]
            print(antPath)
            print(antCapacity)

    return

def spin_wheel(probabilites):

    cities_indexes = list(map(lambda x: x["index"], probabilites))
    cities_weights = list(map(lambda x: x["pick_probability"], probabilites))
    picked_index = random.choices(population=cities_indexes, weights=cities_weights, k=1)[0]
    
    for city in probabilites:
        if city["index"] == picked_index:
            return city

main()

#4 dla każdej iteracji w iterations bierzemy jedną mrówkę z dostępnych mrówek (numberOfAnts)
    #5 dla każej mrówki w iteracji
        #6 dodajemy punkt początkowy do trasy mrówki (baza ciężarówek)
        #7 losowo wybieramy pierwsze miasto z dostępnych miast do którego uda się mrówka
        #8 ustawiamy capacity mrówki na 1000
        #9 while (mrówka.capacity > 0)
            # wybierz miasto na podstawie prawdopodobienstwa i sprawdź czy mrówka ma wystacząjaco towaru zeby zaspokoić potrzebę klienta
            # jeśli wybór poprawny to dodaj miasto do odwiedzwonych miast
            # jeśli wybór jest niemożliwy bo mrówka nie ma wystarczająco capacity to wróć do bazy 
            # zapisz wynik w tymczasowej tablicy wynikow
        #wez kolejna mrówke
    # jesli wynik iteracji jest lepszy od najlepszego wyniku to zapisz wynik iteracji