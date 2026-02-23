# Instalar Node.js e npm na VM (Ubuntu/Debian)

O ArchiSuite precisa de **Node.js 18+** e **npm**. Escolha uma das opções abaixo.

---

## Opção 1 — Rápida (repositório da distro)

```bash
sudo apt update
sudo apt install -y nodejs npm
node -v
npm -v
```

Pode vir uma versão mais antiga do Node (ex.: 18 ou 20). Se for 18 ou superior, pode usar. Se for muito antiga (ex.: 12), use a Opção 2.

---

## Opção 2 — Node.js 20 LTS (recomendado)

Usando o repositório oficial NodeSource:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # deve mostrar v20.x
npm -v
```

Depois:

```bash
cd ~/arsenal/git/arqhub
npm install
npm run dev
```

---

## Se der erro com `curl` ou repositório

Instale o Node 20 manualmente:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
