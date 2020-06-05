from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.
User = get_user_model()
class Tracks(models.Model):
	title 		= models.CharField(max_length=120)
	description =  models.TextField(blank=True, null=True)
	url         =  models.URLField()
	created_at  =  models.DateTimeField(auto_now_add=True)
	posted_by   = models.ForeignKey(User,null=True,on_delete=models.CASCADE)   #null=False,blank=False,on_delete=models.CASCADE

	def __str__(self):
		return self.title

class Like(models.Model):
	user   = models.ForeignKey(User,null=True,on_delete=models.CASCADE)
	track  = models.ForeignKey('tracks.Tracks', related_name='likes', on_delete=models.CASCADE)

	def __str__(self):
		return self.user.username