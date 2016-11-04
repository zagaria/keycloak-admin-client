test: lint
	npm test

ci: lint
	npm run dependencyCheck
	npm run docs

lint: node_modules
	npm run lint

cleanup:
	rm -rf node_modules coverage docs publish

node_modules: package.json
	npm install

.PHONY: node_modules
