from django.contrib.auth import get_user_model
import graphene
from graphene_django import DjangoObjectType

User = get_user_model()

class UserType(DjangoObjectType):
	class Meta:
		model = User
		#only.fields = ('id','username','email','password','is_ac') TO SELECT A SPECIFIC FIELD ON GRAPHQL

class Query(graphene.ObjectType):
	user  = graphene.Field(UserType,id=graphene.Int(required=True))
	me    = graphene.Field(UserType)

	def resolve_user(self,info,id):
		return User.objects.get(id=id)

	def resolve_me(self,info):
		user = info.context.user
		if user.is_anonymous:
			raise Exception("Not Logged In!")
		return user


class CreateUser(graphene.Mutation):
	user = graphene.Field(UserType)
	class Arguments:
		username  = graphene.String(required=True)
		password  = graphene.String(required=True)
		email     = graphene.String(required=True)

	def mutate(self,info,username,password,email):
		user = User(username=username,email=email)
		user.set_password(password)
		user.save()
		return CreateUser(user=user)

class Mutation(graphene.ObjectType):
	create_user = CreateUser.Field()

