import pytest
import pandas as pd
from main import detect_bias

def test_bias_detection_mathematics():
    # Create a balanced dummy dataset
    data = {
        'gender': ['Male', 'Male', 'Female', 'Female'],
        'outcome': [1, 1, 1, 1] # Everyone selected
    }
    df = pd.DataFrame(data)
    
    # Run audit
    results, privileged, privileged_sr, overall_bias = detect_bias(df, 'outcome', 'gender')
    
    # For a perfect 1:1 selection:
    # di_ratio (Disparate Impact) should be 1.0 (Fair)
    # sp_diff (Statistical Parity) should be 0.0 (Fair)
    for res in results.values():
        assert res['di_ratio'] == 1.0
        assert res['sp_diff'] == 0.0

def test_bias_detection_imbalance():
    # Create a biased dataset
    data = {
        'gender': ['Male', 'Male', 'Female', 'Female'],
        'outcome': [1, 1, 0, 0] # Only males selected
    }
    df = pd.DataFrame(data)
    
    results, privileged, privileged_sr, overall_bias = detect_bias(df, 'outcome', 'gender')
    
    # Females DI should be 0.0 (Biased)
    assert 'Female' in results
    assert results['Female']['di_ratio'] == 0.0
    assert overall_bias == 0.0
