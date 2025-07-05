# 🚀 CI/CD Seguro e Automatizado na AWS

Projeto desenvolvido durante o **Desafio Labs 2.0** da **Mentoria Formação AWS** com Henrylle Maia. Esta entrega foca na construção de um pipeline de **CI/CD completo, seguro e automatizado** utilizando os principais serviços da AWS.

---

## 📌 Objetivo

Implementar um fluxo de **entrega contínua (CI/CD)** com execução de migrations e deploy para produção, integrando boas práticas de segurança, rede e automação.

---

## 🧱 Arquitetura da Solução

![Arquitetura da Solução](./images/arquitetura-cicd.png)

A arquitetura contempla:

- **AWS CodePipeline**: Orquestra o fluxo de CI/CD.
- **AWS CodeBuild**: Responsável pelo build, execução de migrations e deploy.
- **AWS Secrets Manager**: Armazena credenciais e segredos de forma segura.
- **Amazon RDS**: Banco de dados relacional acessado durante o build.
- **NAT Gateway**: Permite que recursos em sub-redes privadas acessem a internet.
- **AWS Systems Manager (SSM)**: Utilizado para troubleshooting de builds e rede.

---

## ⚙️ Tecnologias e Serviços Utilizados

- AWS CodePipeline  
- AWS CodeBuild  
- AWS Secrets Manager  
- Amazon RDS (MySQL/PostgreSQL)  
- Amazon VPC (sub-redes públicas/privadas + NAT Gateway)  
- AWS Systems Manager (Session Manager)  
- GitHub (repositório fonte)  
- Scripts de Migrations (ORM ou SQL direto)  

---

## 🔄 Fluxo CI/CD

1. **Trigger**: Push no GitHub dispara o pipeline.  
2. **Build**: CodeBuild é acionado, acessa Secrets Manager e executa:
   - Instalações  
   - Migrations no banco RDS  
3. **Deploy**: Ocorre após execução bem-sucedida.  
4. **Observabilidade**: Logs e troubleshooting via CloudWatch e SSM.

---

## 🛡️ Segurança

- Uso de **IAM Roles restritivos** para acesso mínimo necessário.  
- Integração com **Secrets Manager** para proteger variáveis sensíveis.  
- Recursos em **sub-redes privadas**, com acesso externo controlado via NAT Gateway.

---

## 🐞 Troubleshooting com SSM

Em caso de falha no build ou problemas de comunicação com o RDS, foi utilizado o **Session Manager** do **AWS Systems Manager** para acesso seguro e sem necessidade de chave SSH aos recursos da VPC.

---

## ✅ Resultados Alcançados

- CI/CD funcional e seguro na AWS  
- Deploy automatizado e controlado  
- Gerenciamento seguro de segredos  
- Diagnóstico eficaz via SSM em rede privada  
- Experiência prática com boas práticas de DevOps na nuvem

---

## 📸 Evidências Visuais do Projeto

### 1. Arquitetura da Solução CI/CD na AWS  
Representação visual da arquitetura com todos os serviços integrados no fluxo de entrega contínua.  
![Arquitetura da Solução](./images/arquitetura-cicd.png)

---

### 2. Pipeline Automatizado com CodePipeline  
Visualização dos estágios de Source, Build, Testes e Deploy totalmente automatizados.  
![CodePipeline](./images/codepipeline.png)

---

### 3. Gerenciamento Seguro de Credenciais com Secrets Manager  
Integração segura de segredos e variáveis sensíveis no fluxo de build e deploy.  
![Secrets Manager](./images/secrets-manager.png)

---

### 4. Build Automatizado com Migrations e Testes  
Execução automática de migrations e validação de testes no ambiente de build.  
![Build com Migrations e Testes](./images/codebuild-migrations-testes.png)

---

### 5. Troubleshooting com AWS Systems Manager (SSM)  
Diagnóstico e resolução de falhas utilizando acesso seguro via Session Manager.  
![SSM Troubleshooting](./images/ssm-troubleshooting.png)

---

### 6. Configuração de NAT Gateway para Comunicação Segura  
Rota configurada para permitir acesso do CodeBuild ao RDS em rede privada.  
![NAT Gateway](./images/nat-gateway-config.png)

---

### 7. Deploy Automatizado Após Validação de Testes  
Entrega contínua em produção condicionada ao sucesso dos testes automatizados.  
![Deploy Automatizado](./images/deploy-automatizado.png)

---

### 8. Execução dos Testes Automatizados no Pipeline  
Garantia de integridade da aplicação antes da promoção para produção.  
![Testes Automatizados](./images/testes-pipeline.png)

---

## 📚 Aprendizados

- Integração de diversos serviços AWS em uma arquitetura prática  
- Gerenciamento de rede privada com NAT Gateway  
- Uso de SSM para depuração segura sem SSH

---

## 📢 Créditos

Projeto realizado durante a **Mentoria Desafios Fundamentais da Formação AWS - Henrylle Maia**.

---

## 🌐 Contato

Desenvolvido por **Aryane Andrade**  
[LinkedIn](https://www.linkedin.com/in/aryane-andrade/) 
