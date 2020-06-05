import graphene
from django.db.models import Q
from graphql import GraphQLError
from graphene_django import DjangoObjectType
from users.schema import UserType
from .models import Tracks,Like

class TrackType(DjangoObjectType):
	class Meta:
		model = Tracks

class LikeType(DjangoObjectType):
	class Meta:
		model = Like

class Query(graphene.ObjectType):
	tracks = graphene.List(TrackType, search=graphene.String())
	likes  = graphene.List(LikeType) 

	def resolve_tracks(self,info, search=None):
		if search:
			filters = (
				Q(title__icontains=search) |
				Q(description__icontains=search) |
				Q(url__icontains=search) |
				Q(posted_by__username__icontains=search)
				)
			return Tracks.objects.filter(filters)

		return Tracks.objects.all()

	def resolve_likes(self,info):
		return Like.objects.all()

class CreateTrack(graphene.Mutation):
	track = graphene.Field(TrackType)
	class Arguments:
		title       = graphene.String()
		description = graphene.String()
		url         =  graphene.String()

	def mutate(self,info,**kwargs):
		title = kwargs.get('title')
		description = kwargs.get('description')
		url = kwargs.get('url')
		#########
		user = info.context.user
		if user.is_anonymous:
			raise GraphQLError("Log in to add a track")
		track = Tracks(title=title,description=description,url=url,posted_by=user)
		track.save()
		return CreateTrack(track=track)

class UpdateTrack(graphene.Mutation):
	track = graphene.Field(TrackType)
	class Arguments:
		track_id    = graphene.Int(required=True)
		title       = graphene.String()
		description = graphene.String()
		url         =  graphene.String()

	def mutate(self,info,track_id,title,description,url):
		user = info.context.user
		track = Tracks.objects.get(id=track_id)
		if track.posted_by != user:
			raise GraphQLError("Not Permitted to update track")
		track.title = title
		track.description = description
		track.url         = url
		track.save()
		return  UpdateTrack(track=track)

class DeleteTrack(graphene.Mutation):
	track_id = graphene.Int()
	class Arguments:
		track_id = graphene.Int(required=True)

	def mutate(self,info,track_id):
		user = info.context.user
		track = Tracks.objects.get(id=track_id)
		if track.posted_by != user:
			raise GraphQLError("Not permitted to delete this track.")
		track.delete()
		return DeleteTrack(track_id=track_id)

class CreateLike(graphene.Mutation):
	user = graphene.Field(UserType)
	track = graphene.Field(TrackType)

	class Arguments:
		track_id = graphene.Int(required=True)

	def mutate(self,info,track_id):
		user = info.context.user
		if user.is_anonymous:
			raise GraphQLError('Login to like track')
		track = Tracks.objects.get(id=track_id)
		if not track:
			raise GraphQLError('Cannot find track with giving track id')
		Like.objects.create(user=user,track=track)
		return CreateLike(user=user,track=track)

class Mutation(graphene.ObjectType):
	create_track = CreateTrack.Field()
	update_track  = UpdateTrack.Field()
	delete_track  = DeleteTrack.Field()
	create_like   = CreateLike.Field()







