import type {
  Context,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Handler,
} from 'aws-lambda'
import * as dynamoose from 'dynamoose'

if (process.env.NODE_ENV === 'develop') {
  dynamoose.aws.ddb.local()
} else {
  const ddb = new dynamoose.aws.ddb.DynamoDB({ region: 'us-east-1' })
  dynamoose.aws.ddb.set(ddb)
}

const schema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const UsersModel = dynamoose.model(process.env.USERS_TABLE_NAME!, schema, {
  update: false,
  create: false,
})

export const handler: Handler = async (
  _event: APIGatewayProxyEventV2,
  _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
  const body = JSON.parse(_event.body as string)

  const user = await UsersModel.create(body)

  return { statusCode: 200, body: JSON.stringify(user) }
}
