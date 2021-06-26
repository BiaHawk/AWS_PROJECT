## Projeto Interdisciplinar para Sistemas de Informação IV
### Arquitetura geral da solução proposta

<p align="center">
  <img src="./arquitetura-projeto.jpg" />
</p>

# Requisição Lambda e caminho dos dados dentro dos serviços AWS
Há um lambda inicial que faz uma requisição a API do INMET, com um cronjob feito nele utilizando o easycron, para fazer essa requisiçao de dados de hora em hora. Esse lambda também possui um filtro para pegar apenas dados das estações de PE. Do lambda vai para o Kinesis data streams, que envia esses dados para o Kinesis Analytics. No analytics é feita a extração da estação que possui a temperatura máxima e mínima da hora e retornando apenas a chave da estação dos respectivos dados, assim como a extração das variáveis escolhidas para o projeto e através de um Lambda envia para uma tabela no DynamoDB. Dentro do dynamoDB existem 2 tabelas, a Sensor e a estacao. A tabela sensor é a que recebe diretamente os dados do analytics e a tabela estacao é aque armazena as informações das estações para a consulta final.

# Lambdas de cálculo e consulta final
São 5 lambdas que fazem o cálculo da variável solicitada, cada um com o retorno esperado dentro do escopo do projeto. 


## Requisições finais possíveis
É possível consultar a temperatura máxima, teperatura média, temperatura mínima, precipitação total e velocidade do vento instantânea, com os seguintes endpoints:
  ```http
/tempmax
/tempmed
/tempmin
/precipitacao
/velmed
  ```
