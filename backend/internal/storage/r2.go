package storage

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"pag-backend/internal/config"
)

type Storage interface {
	Upload(ctx context.Context, key string, body io.Reader, contentType string) (string, error)
	Delete(ctx context.Context, key string) error
	GetPresignedUploadURL(ctx context.Context, key string, contentType string, expiry time.Duration) (string, error)
}

type R2Storage struct {
	client        *s3.Client
	presignClient *s3.PresignClient
	bucket        string
	publicDomain  string
	uploadPrefix  string
}

func NewR2(cfg *config.Config) (*R2Storage, error) {
	uploadPrefix := strings.Trim(cfg.R2UploadPrefix, "/")

	if cfg.R2AccessKeyID == "" || cfg.R2SecretAccessKey == "" || cfg.R2Endpoint == "" {
		// Return no-op or uninitialized storage if credentials not provided
		return &R2Storage{
			bucket:       cfg.R2BucketName,
			publicDomain: cfg.R2PublicDomain,
			uploadPrefix: uploadPrefix,
		}, nil
	}

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: cfg.R2Endpoint,
		}, nil
	})

	customConfig, err := awsConfig.LoadDefaultConfig(context.TODO(),
		awsConfig.WithEndpointResolverWithOptions(r2Resolver),
		awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.R2AccessKeyID, cfg.R2SecretAccessKey, "")),
		awsConfig.WithRegion(cfg.R2Region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load R2 config: %w", err)
	}

	client := s3.NewFromConfig(customConfig)
	presignClient := s3.NewPresignClient(client)

	return &R2Storage{
		client:        client,
		presignClient: presignClient,
		bucket:        cfg.R2BucketName,
		publicDomain:  strings.TrimRight(cfg.R2PublicDomain, "/"),
		uploadPrefix:  uploadPrefix,
	}, nil
}

func (s *R2Storage) formatKey(key string) string {
	cleanKey := strings.TrimLeft(key, "/")
	if s.uploadPrefix != "" && !strings.HasPrefix(cleanKey, s.uploadPrefix+"/") {
		return s.uploadPrefix + "/" + cleanKey
	}
	return cleanKey
}

func (s *R2Storage) Upload(ctx context.Context, key string, body io.Reader, contentType string) (string, error) {
	if s.client == nil {
		return "", fmt.Errorf("R2 storage client is not configured")
	}

	cleanKey := s.formatKey(key)
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(cleanKey),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload object to R2: %w", err)
	}

	publicURL := fmt.Sprintf("%s/%s", s.publicDomain, cleanKey)
	return publicURL, nil
}

func (s *R2Storage) Delete(ctx context.Context, key string) error {
	if s.client == nil {
		return fmt.Errorf("R2 storage client is not configured")
	}

	cleanKey := s.formatKey(key)
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(cleanKey),
	})
	if err != nil {
		return fmt.Errorf("failed to delete object from R2: %w", err)
	}
	return nil
}

func (s *R2Storage) GetPresignedUploadURL(ctx context.Context, key string, contentType string, expiry time.Duration) (string, error) {
	if s.presignClient == nil {
		return "", fmt.Errorf("R2 presign client is not configured")
	}

	cleanKey := s.formatKey(key)
	request, err := s.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(cleanKey),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned upload URL: %w", err)
	}

	return request.URL, nil
}
