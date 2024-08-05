import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkApiCanaryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloFunction = new NodejsFunction(this, "HelloFunction", {
      entry: "lambda/hello.ts",
      handler: "handler",
    });

    const helloV2Function = new NodejsFunction(this, "HelloV2Function", {
      entry: "lambda/hellov2.ts",
      handler: "handler",
    });

    const api = new apigw.RestApi(this, "HelloApi");

    const helloIntegration = new apigw.LambdaIntegration(helloFunction);
    api.root.addMethod("GET", helloIntegration);

    const deployment = new apigw.CfnDeployment(this, "MyDeployment", {
      restApiId: api.restApiId,
      stageName: "prod",
      /*deploymentCanarySettings: {
        percentTraffic: 10,
        stageVariableOverrides: {
          lambdaAlias: "canary",
        },
      },*/
    });

    new apigw.CfnStage(this, "MyStage", {
      restApiId: api.restApiId,
      stageName: "prod",
      deploymentId: deployment.ref,
      /*canarySetting: {
        percentTraffic: 10,
        stageVariableOverrides: {
          lambdaAlias: "canary",
        },
        useStageCache: false,
      },*/
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url || "Something went wrong with the deploy",
    });
  }
}
