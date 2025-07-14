### Devin

- [Devin's Machine](https://app.devin.ai/workspace) でリポジトリ追加

#### 1.Git Pull
- そのまま

#### 2.Configure Secrets
```sh
# 環境変数用のファイル作成
$ touch .envrc

# .envrc に下記を入力. xxx は適宜更新

export NEXT_PUBLIC_API_URL=http://localhost:8000
export DJANGO_SUPERUSER_USERNAME=hoge
export DJANGO_SUPERUSER_EMAIL=hoge@test.com
export DJANGO_SUPERUSER_PASSWORD=hogehoge
export DJANGO_SECRET_KEY=hogehoge
export POSTGRES_DB=hoge
export POSTGRES_USER=hoge
export POSTGRES_PASSWORD=hogehoge

# 環境変数を読み込む
$ direnv allow
```

- ローカル用
```sh
$ brew install direnv
```
#### 4.Maintain Dependencies
```sh
# ローカルM1Mac用
$ docker compose -f docker-compose.mac.yaml up -d
# Devin用
$ docker compose -f docker-compose.ubuntu.yaml up -d

# コンテナ作り直し
$ ./remake-container.sh mac
$ ./remake-container.sh ubuntu
```

#### 5.SetUp Lint
```sh
# ローカルM1Mac用
$ docker compose -f docker-compose.mac.yaml run --rm backend uv run ruff check .
$ docker compose -f docker-compose.mac.yaml run --rm frontend npx next lint

# Devin用
$ docker compose -f docker-compose.ubuntu.yaml run --rm backend uv run ruff check .
$ docker compose -f docker-compose.ubuntu.yaml run --rm frontend npx next lint
```

#### 6.SetUp Tests
- no tests ran in 0.00s だと Devin の Verify が通らないっぽい
```sh
# ローカルM1Mac用
$ docker compose -f docker-compose.mac.yaml run --rm backend uv run pytest
$ docker compose -f docker-compose.mac.yaml run --rm frontend npm run test

# Devin用
$ docker compose -f docker-compose.ubuntu.yaml run --rm backend uv run pytest
$ docker compose -f docker-compose.ubuntu.yaml run --rm frontend npm run test

# Playwright
# ローカルM1Mac用
$ docker compose -f docker-compose.mac.yaml run --rm frontend npx playwright test --project firefox

# Devin用
# Playwright
$ docker compose -f docker-compose.ubuntu.yaml run --rm frontend npx playwright test --project firefox
```

### 7.Setup Local App

```sh
$ http://localhost:3000/ がフロントエンドのURL
$ http://localhost:8000/ がバックエンドのURL
```

#### 8.Additional Notes
- 必ず日本語で回答してください
を入力

### OPENAI-API で PR-Review
- [Qodo Merge](https://qodo-merge-docs.qodo.ai/installation/github/)
  - GPT-4.1利用
  - 日本語の回答をするようプロンプト設定
- GitHub の Repository >> Settings >> Secretes and variables >> Actions の Repository secrets の New repository secret を登録
  - OPENAI_KEY という名称で OPENAI API keys の SECRET KEY を登録
    - [OPENAI API keys](https://platform.openai.com/settings/organization/api-keys) 
```sh
--- .github/
           |- workflows/
                        |-- pr_agent.yml
```
### Django
- app 追加
```sh
# ローカルM1Mac用
$ mkdir -p backend/app/api
$ docker compose -f docker-compose.mac.yaml run --rm backend uv run django-admin startapp api app/api
$ docker compose -f docker-compose.mac.yaml run --rm backend uv run python app/manage.py makemigrations
$ docker compose -f docker-compose.mac.yaml run --rm backend uv run python app/manage.py migrate

# Devin用
$ mkdir -p backend/app/api
$ docker compose -f docker-compose.ubuntu.yaml run --rm backend uv run django-admin startapp api app/api
$ docker compose -f docker-compose.ubuntu.yaml run --rm backend uv run python app/manage.py makemigrations
$ docker compose -f docker-compose.ubuntu.yaml run --rm backend uv run python app/manage.py migrate
```
