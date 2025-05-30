OPENAI_API_KEY=<use your api key>
GITHUB_TOKEN=<use github token>
GITHUB_OWNER=<use git hub user id>
GITHUB_REPO=<use git hub repo which you want to generate tests>
BASE_REF=<give branch as main for ref comparision>
HEAD_REF=<give feature branch name to compare with main branch>

to execute tests use command
npx ts-node src/run.ts
