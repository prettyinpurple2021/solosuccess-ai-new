# Auto-Scaling Configuration

This document describes the auto-scaling configuration for the SoloSuccess AI platform.

## Overview

Auto-scaling ensures the platform can handle varying loads efficiently while optimizing costs. The system automatically scales resources up during high demand and scales down during low demand.

## Components

### 1. ECS Service Auto-Scaling

The AI service running on ECS automatically scales based on multiple metrics.

#### Scaling Policies

**CPU-Based Scaling**
- Target: 70% CPU utilization
- Scale out when CPU > 70% for 2 consecutive periods (5 minutes)
- Scale in when CPU < 70% for 5 consecutive periods (25 minutes)
- Cooldown: 60 seconds (scale out), 300 seconds (scale in)

**Memory-Based Scaling**
- Target: 80% memory utilization
- Scale out when memory > 80% for 2 consecutive periods (5 minutes)
- Scale in when memory < 80% for 5 consecutive periods (25 minutes)
- Cooldown: 60 seconds (scale out), 300 seconds (scale in)

**Request Count-Based Scaling**
- Target: 1000 requests per target
- Scales based on ALB request count per target
- Ensures consistent response times under load

#### Capacity Limits

**Production:**
- Minimum: 2 tasks
- Maximum: 10 tasks
- Peak hours minimum: 4 tasks

**Staging:**
- Minimum: 1 task
- Maximum: 3 tasks

#### Scheduled Scaling

Predictable traffic patterns are handled with scheduled scaling:

**Morning Scale-Up (8 AM UTC)**
- Increases minimum capacity to 4 tasks
- Prepares for business hours traffic

**Evening Scale-Down (10 PM UTC)**
- Reduces minimum capacity to 2 tasks
- Optimizes costs during low-traffic hours

### 2. RDS Read Replica Auto-Scaling

Database read replicas scale based on load to handle read-heavy workloads.

#### Scaling Triggers

**CPU Utilization**
- Add replica when primary CPU > 70% for 10 minutes
- Remove replica when all replicas CPU < 40% for 30 minutes

**Connection Count**
- Add replica when connections > 80% of max for 10 minutes
- Remove replica when connections < 40% of max for 30 minutes

**Replication Lag**
- Alert when lag > 1 second
- Add replica if lag persists > 5 minutes

#### Capacity Limits

**Production:**
- Minimum: 1 read replica
- Maximum: 5 read replicas

**Staging:**
- Minimum: 0 read replicas
- Maximum: 1 read replica

#### Scaling Process

1. Lambda function runs every 5 minutes
2. Checks CloudWatch metrics for primary and replicas
3. Calculates required replica count
4. Creates or deletes replicas as needed
5. Updates Route53 weighted routing

### 3. ElastiCache Auto-Scaling

Redis cache cluster scales based on memory and CPU usage.

#### Scaling Policies

**Memory-Based**
- Add node when memory > 75% for 10 minutes
- Remove node when memory < 40% for 30 minutes

**CPU-Based**
- Add node when CPU > 70% for 10 minutes
- Remove node when CPU < 40% for 30 minutes

#### Capacity Limits

**Production:**
- Minimum: 2 nodes
- Maximum: 6 nodes

**Staging:**
- Minimum: 1 node
- Maximum: 2 nodes

### 4. Application Load Balancer

ALB automatically distributes traffic across healthy targets.

#### Health Checks

- Interval: 30 seconds
- Timeout: 5 seconds
- Healthy threshold: 2 consecutive successes
- Unhealthy threshold: 3 consecutive failures
- Path: `/health`

#### Connection Draining

- Timeout: 300 seconds
- Allows in-flight requests to complete before deregistering targets

### 5. CloudFront CDN

CloudFront automatically scales to handle traffic spikes.

#### Configuration

- Origin shield enabled for additional caching layer
- Automatic compression for text-based content
- Geographic distribution across all edge locations
- Automatic failover to secondary origin

## Monitoring

### CloudWatch Metrics

**ECS Service:**
- CPUUtilization
- MemoryUtilization
- DesiredTaskCount
- RunningTaskCount
- TargetResponseTime

**RDS:**
- CPUUtilization
- DatabaseConnections
- ReadLatency
- WriteLatency
- ReplicaLag

**ElastiCache:**
- CPUUtilization
- DatabaseMemoryUsagePercentage
- CacheHits
- CacheMisses
- NetworkBytesIn/Out

**ALB:**
- RequestCount
- TargetResponseTime
- HealthyHostCount
- UnHealthyHostCount
- HTTPCode_Target_4XX_Count
- HTTPCode_Target_5XX_Count

### CloudWatch Alarms

**Critical Alarms (PagerDuty + Slack):**
- ECS service CPU > 90% for 10 minutes
- RDS primary CPU > 90% for 10 minutes
- All ECS tasks unhealthy
- RDS replica lag > 5 seconds

**Warning Alarms (Slack):**
- ECS service CPU > 80% for 15 minutes
- RDS connections > 80% of max
- Cache hit rate < 70%
- ALB 5XX errors > 1% of requests

### Dashboards

**Auto-Scaling Dashboard:**
- Current task count vs desired count
- Scaling activity timeline
- CPU and memory utilization trends
- Request count and response time
- Cost optimization metrics

**Database Dashboard:**
- Primary and replica metrics
- Connection pool utilization
- Query performance
- Replication lag
- Read/write split ratio

## Cost Optimization

### Strategies

1. **Right-Sizing**
   - Regular review of instance sizes
   - Adjust based on actual usage patterns
   - Use Compute Optimizer recommendations

2. **Scheduled Scaling**
   - Scale down during off-peak hours
   - Weekend capacity reduction
   - Holiday schedule adjustments

3. **Spot Instances**
   - Use Spot instances for non-critical workloads
   - Fargate Spot for ECS tasks (up to 70% savings)
   - Fallback to On-Demand if Spot unavailable

4. **Reserved Capacity**
   - Reserved instances for baseline capacity
   - Savings Plans for predictable usage
   - 1-year or 3-year commitments

5. **Storage Optimization**
   - S3 Intelligent-Tiering for file storage
   - RDS storage auto-scaling
   - Regular cleanup of old data

### Cost Monitoring

**Metrics Tracked:**
- Cost per user
- Cost per request
- Infrastructure cost breakdown
- Scaling cost impact
- Optimization opportunities

**Alerts:**
- Daily cost exceeds budget by 20%
- Unusual cost spike detected
- Underutilized resources identified

## Configuration

### Terraform Variables

```hcl
# ECS Auto-Scaling
ecs_min_capacity = 2
ecs_max_capacity = 10
ecs_cpu_target = 70
ecs_memory_target = 80
ecs_requests_per_target = 1000

# RDS Read Replicas
rds_min_replicas = 1
rds_max_replicas = 5
rds_replica_instance_class = "db.t3.medium"

# ElastiCache
redis_min_nodes = 2
redis_max_nodes = 6
redis_node_type = "cache.t3.medium"

# Scheduled Scaling
peak_hours_min_capacity = 4
off_peak_hours_min_capacity = 2
```

### Environment-Specific Settings

**Production:**
```hcl
environment = "production"
ecs_min_capacity = 2
ecs_max_capacity = 10
rds_min_replicas = 1
rds_max_replicas = 5
redis_min_nodes = 2
redis_max_nodes = 6
```

**Staging:**
```hcl
environment = "staging"
ecs_min_capacity = 1
ecs_max_capacity = 3
rds_min_replicas = 0
rds_max_replicas = 1
redis_min_nodes = 1
redis_max_nodes = 2
```

## Testing

### Load Testing

**Tools:**
- k6 for API load testing
- Artillery for complex scenarios
- AWS Load Testing Solution

**Test Scenarios:**

1. **Gradual Ramp-Up**
   - Start: 10 users
   - Ramp to: 1000 users over 30 minutes
   - Verify: Smooth scaling, no errors

2. **Spike Test**
   - Sudden increase from 100 to 1000 users
   - Verify: Quick scale-out, stable performance

3. **Sustained Load**
   - Maintain 500 users for 2 hours
   - Verify: Stable performance, no memory leaks

4. **Scale-Down Test**
   - Decrease from 1000 to 100 users
   - Verify: Proper scale-in, cost optimization

### Scaling Verification

```bash
# Monitor ECS scaling
aws ecs describe-services \
  --cluster solosuccess-production \
  --services solosuccess-ai-service \
  --query 'services[0].[desiredCount,runningCount]'

# Check scaling activity
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/solosuccess-production/solosuccess-ai-service

# Monitor RDS replicas
aws rds describe-db-instances \
  --filters "Name=db-instance-id,Values=production-solosuccess-db*" \
  --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus]'
```

## Troubleshooting

### Common Issues

**Issue: Service not scaling out**
- Check CloudWatch metrics
- Verify scaling policies are active
- Check IAM permissions
- Review cooldown periods

**Issue: Excessive scaling activity**
- Review metric thresholds
- Adjust cooldown periods
- Check for metric anomalies
- Consider scheduled scaling

**Issue: High costs**
- Review scaling limits
- Check for stuck scale-out
- Verify scale-in is working
- Review instance sizes

**Issue: Performance degradation during scaling**
- Increase scale-out speed
- Reduce cooldown periods
- Pre-warm instances
- Use connection draining

### Debug Commands

```bash
# Check current scaling status
aws application-autoscaling describe-scalable-targets \
  --service-namespace ecs

# View scaling policies
aws application-autoscaling describe-scaling-policies \
  --service-namespace ecs \
  --resource-id service/solosuccess-production/solosuccess-ai-service

# Check CloudWatch alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix solosuccess-ai-service

# View recent scaling activities
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --max-results 20
```

## Best Practices

1. **Set Appropriate Limits**
   - Don't set max capacity too low
   - Ensure min capacity handles baseline load
   - Leave headroom for traffic spikes

2. **Use Multiple Metrics**
   - Combine CPU, memory, and request count
   - Prevents over-reliance on single metric
   - More accurate scaling decisions

3. **Configure Cooldowns**
   - Longer cooldown for scale-in (avoid flapping)
   - Shorter cooldown for scale-out (quick response)
   - Adjust based on application startup time

4. **Monitor Costs**
   - Set up cost alerts
   - Review scaling patterns weekly
   - Optimize based on actual usage

5. **Test Regularly**
   - Monthly load tests
   - Verify scaling behavior
   - Update thresholds as needed

6. **Document Changes**
   - Track scaling configuration changes
   - Document reasons for adjustments
   - Review impact of changes

## Maintenance

### Regular Tasks

**Weekly:**
- Review scaling activity logs
- Check for anomalies
- Verify cost optimization

**Monthly:**
- Load testing
- Review and adjust thresholds
- Analyze cost trends
- Update documentation

**Quarterly:**
- Comprehensive scaling review
- Capacity planning
- Cost optimization analysis
- Update scaling strategies

## References

- [AWS ECS Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html)
- [RDS Read Replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html)
- [ElastiCache Scaling](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/Scaling.html)
- [Application Auto Scaling](https://docs.aws.amazon.com/autoscaling/application/userguide/what-is-application-auto-scaling.html)
