from rest_framework import serializers
from .models import Event, EventRegistration, EventPhoto, EventFeedback


class EventPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPhoto
        fields = '__all__'


class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = '__all__'
        read_only_fields = ('barcode', 'registered_at', 'checked_in_at')


class EventFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventFeedback
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    photos = EventPhotoSerializer(many=True, read_only=True)
    current_registrations = serializers.IntegerField(read_only=True)

    class Meta:
        model = Event
        fields = '__all__'
