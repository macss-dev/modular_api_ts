// ============================================================
// core/metrics/metric_registry.ts
// Wraps prom-client with a two-layer API:
//   MetricRegistry — internal, manages prom-client Registry
//   MetricsRegistrar — public, validates names before delegating
// ============================================================

import {
  Registry,
  Counter,
  Gauge,
  Histogram,
  type CounterConfiguration,
  type GaugeConfiguration,
  type HistogramConfiguration,
} from 'prom-client';

/** Prometheus metric name regex. */
const VALID_NAME = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;

function assertValidName(name: string): void {
  if (!name || !VALID_NAME.test(name)) {
    throw new Error(
      `Invalid metric name "${name}": must match [a-zA-Z_:][a-zA-Z0-9_:]*`,
    );
  }
}

// ── MetricRegistry (internal) ─────────────────────────────────────────

/**
 * Internal registry wrapping prom-client's `Registry`.
 *
 * On construction, registers `process_start_time_seconds` as a gauge
 * set to the current epoch in seconds.
 */
export class MetricRegistry {
  readonly registry: Registry;
  private readonly names = new Set<string>();

  constructor() {
    this.registry = new Registry();

    // Auto-register process_start_time_seconds.
    const startTime = this.createGauge({
      name: 'process_start_time_seconds',
      help: 'Start time of the process since unix epoch in seconds.',
    });
    startTime.set(Date.now() / 1000);
  }

  createCounter<T extends string = string>(
    config: Pick<CounterConfiguration<T>, 'name' | 'help' | 'labelNames'>,
  ): Counter<T> {
    this.assertUnique(config.name);
    const counter = new Counter<T>({
      ...config,
      registers: [this.registry],
    });
    return counter;
  }

  createGauge<T extends string = string>(
    config: Pick<GaugeConfiguration<T>, 'name' | 'help' | 'labelNames'>,
  ): Gauge<T> {
    this.assertUnique(config.name);
    const gauge = new Gauge<T>({
      ...config,
      registers: [this.registry],
    });
    return gauge;
  }

  createHistogram<T extends string = string>(
    config: Pick<HistogramConfiguration<T>, 'name' | 'help' | 'labelNames' | 'buckets'>,
  ): Histogram<T> {
    this.assertUnique(config.name);
    const histogram = new Histogram<T>({
      ...config,
      registers: [this.registry],
    });
    return histogram;
  }

  /** Serializes all metrics to Prometheus text exposition format. */
  async serialize(): Promise<string> {
    return this.registry.metrics();
  }

  /** Content type for the Prometheus text format. */
  get contentType(): string {
    return this.registry.contentType;
  }

  private assertUnique(name: string): void {
    if (this.names.has(name)) {
      throw new Error(`Metric "${name}" is already registered.`);
    }
    this.names.add(name);
  }
}

// ── MetricsRegistrar (public) ─────────────────────────────────────────

/**
 * Public API for users to register custom metrics.
 * Validates names and rejects reserved prefixes before delegating.
 */
export class MetricsRegistrar {
  constructor(private readonly registry: MetricRegistry) {}

  createCounter<T extends string = string>(
    config: Pick<CounterConfiguration<T>, 'name' | 'help' | 'labelNames'>,
  ): Counter<T> {
    this.validate(config.name);
    return this.registry.createCounter(config);
  }

  createGauge<T extends string = string>(
    config: Pick<GaugeConfiguration<T>, 'name' | 'help' | 'labelNames'>,
  ): Gauge<T> {
    this.validate(config.name);
    return this.registry.createGauge(config);
  }

  createHistogram<T extends string = string>(
    config: Pick<HistogramConfiguration<T>, 'name' | 'help' | 'labelNames' | 'buckets'>,
  ): Histogram<T> {
    this.validate(config.name);
    return this.registry.createHistogram(config);
  }

  private validate(name: string): void {
    assertValidName(name);
    if (name.startsWith('__')) {
      throw new Error(`Metric name "${name}" uses reserved prefix "__".`);
    }
  }
}
