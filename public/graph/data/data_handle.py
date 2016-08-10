
import json

users = "raw_data.json"

with open(users) as data_file:    
    data = json.load(data_file)


# loop over users
nodes = list()
edges = list()
edge_count = 0
wifis = dict()
for user in data.keys():
	tmp = dict()
	tmp["id"] = user
	tmp["group"] = 1
	nodes.append(tmp)
	for wifi in data[user]:
		wifis[wifi] = 1

for wifi in wifis.keys():
	tmp = dict()
	tmp["id"] = wifi
	tmp["group"] = 2
	nodes.append(tmp)

edge_count = 0
edges = list()

for user in data.keys():
	for wifi in data[user]:
		edge_count += 1
		tmp = dict()
		tmp["source"] = user
		tmp["target"] = wifi
		tmp["value"] = 1
		print tmp
		# if edge_count < 100:
		edges.append(tmp)

output = dict()
output["nodes"] = nodes
output["links"] = edges

with open('user_wifi.json', 'w') as outfile:
    json.dump(output, outfile)